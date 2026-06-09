---
{"dg-publish":true,"dg-path":"200 行纯 Python 实现完整 GPT.md","permalink":"/200 行纯 Python 实现完整 GPT/","dg-note-properties":{"slug":"200-line-pure-python-gpt","author":"吉人","created":"2026-05-21","source":null}}
---

Andrej Karpathy 在他的 microgpt.py 开头写了一句话：

> The most atomic way to train and run inference for a GPT in pure, dependency-free Python. This file is the complete algorithm. Everything else is just efficiency.

整个文件大约 200 行，零依赖（连 NumPy 都不用），实现了一个完整的 GPT：自动微分引擎、Transformer 架构、Adam 优化器、文本生成。这不是教学玩具，它真的能训练、能生成文本。这篇文章逐行拆解这份代码，讲清楚每一步在做什么、为什么这么做。

## 全貌：五大组件一览

microgpt.py 由五个部分组成，每个部分解决一个核心问题：

- **数据与分词**：下载人名数据集，字符级分词
- **自动微分引擎**（`Value` 类）：手写标量级反向传播
- **模型参数初始化**：定义 Transformer 的权重矩阵
- **GPT 前向传播**：实现 Transformer 架构
- **训练循环与推理**：Adam 优化器加自回归生成

下面逐一拆解。

## 核心引擎：手写自动微分

### Value 类的设计

整个 GPT 不依赖 PyTorch 的 autograd，而是手写了一个标量级自动微分引擎。核心是 `Value` 类——每一个数字被包装成 `Value` 对象，记录三件事：

- `data`：前向传播时计算的标量值
- `grad`：反向传播时计算的梯度 `dL/dself`
- `_children` 和 `_local_grads`：计算图中的子节点及其局部导数

举个例子，加法 `a + b = c`：c 的 children 是 `(a, b)`，local_grads 是 `(1, 1)`，因为 `dc/da = 1`，`dc/db = 1`。乘法 `a * b = c`：local_grads 是 `(b.data, a.data)`，因为 `dc/da = b`，`dc/db = a`。

通过 Python 的运算符重载，所有数学运算自动构建计算图：

```python
def __add__(self, other):     # 加法：梯度 (1, 1)
    other = other if isinstance(other, Value) else Value(other)
    return Value(self.data + other.data, (self, other), (1, 1))

def __mul__(self, other):     # 乘法：梯度 (other.data, self.data)
    other = other if isinstance(other, Value) else Value(other)
    return Value(self.data * other.data, (self, other), (other.data, self.data))

def log(self):                # d/dx(ln(x)) = 1/x
    return Value(math.log(self.data), (self,), (1/self.data,))

def exp(self):                # d/dx(e^x) = e^x
    return Value(math.exp(self.data), (self,), (math.exp(self.data),))

def relu(self):               # d/dx(max(0,x)) = 1 if x>0 else 0
    return Value(max(0, self.data), (self,), (float(self.data > 0),))
```

其他运算通过组合实现：减法 `a - b = a + (-b)`，除法 `a / b = a * b^(-1)`。

### 反向传播的实现

`backward()` 方法只有十几行，完成了整个反向传播：

```python
def backward(self):
    topo = []
    visited = set()
    def build_topo(v):
        if v not in visited:
            visited.add(v)
            for child in v._children:
                build_topo(child)
            topo.append(v)
    build_topo(self)
    self.grad = 1
    for v in reversed(topo):
        for child, local_grad in zip(v._children, v._local_grads):
            child.grad += local_grad * v.grad
```

三步走：第一，拓扑排序，从损失节点出发递归遍历计算图；第二，损失节点自身梯度设为 1；第三，按拓扑逆序遍历，把梯度乘以局部导数累加到子节点。这就是链式法则的机械实现：`dL/dchild += dL/dparent * dparent/dchild`。

注意用 `+=` 而非 `=`。一个节点可能被多个父节点引用（比如残差连接中的 x），梯度必须累加。这里没有矩阵运算，每个权重都是一个独立的 `Value` 对象，一次前向传播创建海量的计算图节点。效率极低，但正确性一目了然。

## Transformer 架构详解

### 数据与分词

数据集用的是 makemore 项目的 `names.txt`，32000 多个英文人名。模型的任务是学习人名的分布规律，然后生成新的、不存在的人名。分词策略是字符级：

```python
uchars = sorted(set(''.join(docs)))
BOS = len(uchars)
vocab_size = len(uchars) + 1
```

把所有出现过的字符去重排序，每个字符对应一个整数 id。额外加一个 BOS（Beginning of Sequence）token，标记序列的开始和结束。整个词表只有 27 个 token（26 个字母加 BOS），字符级分词的好处是词表极小，模型结构更简单。

### GPT 前向传播

先看三个基础函数。线性层就是矩阵乘向量 `y = Wx`：

```python
def linear(x, w):
    return [sum(wi * xi for wi, xi in zip(wo, x)) for wo in w]
```

Softmax 减去最大值防止 `exp` 溢出。RMSNorm 是 LayerNorm 的简化版，不做均值中心化，只除以均方根。主函数 `gpt()` 的签名值得注意——每次只处理 **一个 token**：

```python
def gpt(token_id, pos_id, keys, values):
```

前向传播流程：token embedding 加 position embedding，经过 rmsnorm，进入 Transformer 层。每层做两件事：多头注意力块（rmsnorm → Q/K/V 投影 → 注意力 → 输出投影 → 残差连接）和 MLP 块（rmsnorm → 升维到 4 倍宽度 → ReLU → 降维回原宽度 → 残差连接）。最后通过 `lm_head` 投影到词表大小的 logits。

### 多头注意力

注意力是 Transformer 的核心：

```python
for h in range(n_head):
    hs = h * head_dim
    q_h = q[hs:hs+head_dim]
    k_h = [ki[hs:hs+head_dim] for ki in keys[li]]
    v_h = [vi[hs:hs+head_dim] for vi in values[li]]
    attn_logits = [sum(q_h[j] * k_h[t][j] for j in range(head_dim)) / head_dim**0.5
                   for t in range(len(k_h))]
    attn_weights = softmax(attn_logits)
    head_out = [sum(attn_weights[t] * v_h[t][j] for t in range(len(v_h)))
                for j in range(head_dim)]
    x_attn.extend(head_out)
```

每个头独立工作：从 Q/K/V 中切出对应片段，计算缩放点积注意力 `QK^T / sqrt(d_k)`，softmax 得到权重，加权求和 value。

`keys[li]` 包含了从位置 0 到当前位置的所有 key，所以当前 token 可以 " 看到 " 自己及之前的所有 token——这就是因果注意力。不需要额外的 mask，因为未来位置的 key 还没加入列表。这也自然实现了 KV cache——PyTorch 里需要显式管理的优化，在这里因为逐 token 前向传播而自然出现。

## 训练、推理与设计取舍

### 训练循环与 Adam 优化器

每个 step 取一条人名，前后各加 BOS token。比如 "emma" 变成 `[BOS, e, m, m, a, BOS]`。逐位置输入 token，预测下一个 token，损失是交叉熵 `-log(P(target))`。反向传播一行搞定：`loss.backward()`。

Adam 优化器是手写的，包含所有关键组件：

```python
m[i] = beta1 * m[i] + (1 - beta1) * p.grad           # 一阶矩（动量）
v[i] = beta2 * v[i] + (1 - beta2) * p.grad ** 2      # 二阶矩（自适应学习率）
m_hat = m[i] / (1 - beta1 ** (step + 1))              # 偏差校正
v_hat = v[i] / (1 - beta2 ** (step + 1))              # 偏差校正
p.data -= lr_t * m_hat / (v_hat ** 0.5 + eps_adam)    # 参数更新
```

一阶矩是梯度的指数移动平均，提供动量方向；二阶矩是梯度平方的指数移动平均，实现自适应学习率；偏差校正补偿初始零值的影响。学习率从 0.01 线性衰减到 0。

### 推理：让模型说话

自回归生成：从 BOS 开始，每步预测下一个 token 作为下一步输入，直到遇到 BOS 或达到最大长度。`temperature` 控制随机性——值越低越倾向概率最高的 token，值越高越随机。

### 关键设计决策

microgpt.py 相对 GPT-2 做了三个简化：RMSNorm 代替 LayerNorm（更简单）、去掉 bias（省参数）、ReLU 代替 GeLU（导数更简单）。最核心的设计选择是 **标量级运算**——这不只是简化，它让每一步运算都完全透明，没有广播、没有 reshape、没有 einsum。代价是速度，PyTorch 通过张量运算和 CUDA 把这加速了几个数量级。

正如 Karpathy 说的：这个文件就是完整的算法，其他一切都只是为了效率。
