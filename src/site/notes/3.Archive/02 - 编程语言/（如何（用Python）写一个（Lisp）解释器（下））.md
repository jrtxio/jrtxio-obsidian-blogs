---
{"dg-publish":true,"dg-path":"02 - 编程语言/（如何（用Python）写一个（Lisp）解释器（下））.md","permalink":"/02 - 编程语言/（如何（用Python）写一个（Lisp）解释器（下））/","created":"2024-01-04T13:05:42.000+08:00","updated":"2025-02-25T10:50:21.074+08:00"}
---

#Technomous #PLT #Lisp 

# 2 号语言：完整的Lispy

现在我们来加上 3 个新的语法形式，构造一个更加完整的 Scheme 子集：

![Pasted image 20240104130617.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240104130617.png)

lambda 特殊形式会创建一个过程（procedure）。（lambda这个名字来源于 Alonzo Church 的 [lambda calculus](https://link.zhihu.com/?target=http%3A//en.wikipedia.org/wiki/Lambda_calculus)）

``` text
lis.py> (define circle-area (lambda (r) (* pi (* r r)))
lis.py> (circle-area 10)
314.159265359
```

过程调用 (circle-area 10) 使我们对过程的主体部分 (* pi (* r r)) 进行求值。求值所在的环境中 pi 与 * 的值同全局环境相同，而 r 的值为 10。事实上，解释器并不会简单地在全局环境之中将 r 的值设为 10。如果我们将 r 用于其他用途会怎么样？我们不希望对 circle-area 的调用改变r的值，因此我们希望将一个局部变量 r 设为 10，这样就不会影响到其他同名的变量。因此，我们需要构建一种新的环境，允许同时创建局部和全局变量。

想法如下：在我们对 (circle-area 10) 求值时，首先提取过程主体部分 (* pi (* r r))，随后在仅有一个本地变量r的环境中求值，但该环境同时也能访问全局环境。下图演示了这种环境模型，局部环境（蓝色）嵌套在全局环境（红色）之中：

![Pasted image 20240104130648.png|250](/img/user/0.Asset/resource/Pasted%20image%2020240104130648.png)

当我们在一个被嵌套的环境中查找变量时，首先在本层查找，如果没有找到对应值的话就到外一层查找。

显然，过程和环境相关，所以我们把他们放到一起：

``` python
class Procedure(object):
    "用户定义的Scheme过程。"
    def __init__(self, parms, body, env):
        self.parms, self.body, self.env = parms, body, env
    def __call__(self, *args): 
        return eval(self.body, Env(self.parms, args, self.env))

class Env(dict):
    "环境是以{'var':val}为键对的字典，它还带着一个指向外层环境的引用。"
    def __init__(self, parms=(), args=(), outer=None):
        self.update(zip(parms, args))
        self.outer = outer
    def find(self, var):
        "寻找变量出现的最内层环境。"
        return self if (var in self) else self.outer.find(var)

global_env = standard_env()
```

我们看到每个过程有 3 个组成部分：一个包含变量名的列表，一个主体表达式，以及一个外层环境。外层环境使得我们在局部环境中无法找到变量时有下一个地方可以寻找。

环境是 dict 的子类，因此它含有 dict 拥有的所有方法。除此之外还有两个额外的方法：

1. 构造器__init__接受一个变量名列表及对应的变量值列表，构造创造一个新环境，内部形式为 {variable: value} 键对，并拥有一个指向外层环境的引用。
2. find 函数用于找到某个变量所在的正确环境，可能是内层环境也可能是更外层的环境。

要想知道这部分的工作原理，我们首先来看看 eval 的定义。注意，现在我们需要调用 env.find(x) 来寻找变量处于哪一层环境之中；随后我们才能从那一层环境之中提取 x。（define 分支的定义没有改变，因为 define 总是向最内一层的环境添加变量。）同时我们还增加了两个判定分支：set! 分支中，我们寻找变量所处的环境并将其设为新的值。通过 lambda，我们可以传入参数列表、主体以及环境以创建一个新的过程。

``` python
def eval(x, env=global_env):
    "在某环境中对一个表达式进行求值。"
    if isinstance(x, Symbol):      # 变量引用
        return env.find(x)[x]
    elif not isinstance(x, List):  # 直面产量
        return x                
    elif x[0] == 'quote':          # 引用
        (_, exp) = x
        return exp
    elif x[0] == 'if':             # 条件判断
        (_, test, conseq, alt) = x
        exp = (conseq if eval(test, env) else alt)
        return eval(exp, env)
    elif x[0] == 'define':         # 定义
        (_, var, exp) = x
        env[var] = eval(exp, env)
    elif x[0] == 'set!':           # 赋值
        (_, var, exp) = x
        env.find(var)[var] = eval(exp, env)
    elif x[0] == 'lambda':         # 过程
        (_, parms, body) = x
        return Procedure(parms, body, env)
    else:                          # 过程调用
        proc = eval(x[0], env)
        args = [eval(arg, env) for arg in x[1:]]
        return proc(*args)
```

为了更好地理解过程和环境是怎样协同运作的，我们来看看下面这段程序。思考一下，在我们对 (account1 -20.00) 求值的时候，程序会生成一个怎样的环境呢？

![Pasted image 20240104130723.png|650](/img/user/0.Asset/resource/Pasted%20image%2020240104130723.png)

每个矩形框代表一个环境，环境的颜色和程序中新定义变量的颜色相对应。在程序的最后两行中，我们定义了 account1 并调用了 (account1 -20.00)，这表示我们创建了一个拥有 100 美金余额的账户，并从中取出 20 美金。在对 (account1 -20.00) 进行求值的过程中，我们会对黄色高亮部分进行求值。该表达式中有三个变量：amt 可以直接在最内层环境（绿色）中找到。但 balance 不在那一层环境之中，我们需要查找绿色的外一层环境（蓝色）。然而变量 ‘+’ 依然不能在这两个环境之中找到，所以我们需要在更外一层环境中寻找（红色的全局环境）。这一先在内层环境查找，再在外层环境中查找的方式被称为“词法作用域”(Lexical Scoping)。Env.find(var) 依照词法作用域规则查找变量所处的正确环境。

现在我们能做的事又多了不少：

``` python
>>> repl()
lis.py> (define circle-area (lambda (r) (* pi (* r r))))
lis.py> (circle-area 3)
28.274333877
lis.py> (define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))
lis.py> (fact 10)
3628800
lis.py> (fact 100)
9332621544394415268169923885626670049071596826438162146859296389521759999322991
5608941463976156518286253697920827223758251185210916864000000000000000000000000
lis.py> (circle-area (fact 10))
4.1369087198e+13
lis.py> (define first car)
lis.py> (define rest cdr)
lis.py> (define count (lambda (item L) (if L (+ (equal? item (first L)) (count item (rest L))) 0)))
lis.py> (count 0 (list 0 1 2 3 0 0))
3
lis.py> (count (quote the) (quote (the more the merrier the bigger the better)))
4
lis.py> (define twice (lambda (x) (* 2 x)))
lis.py> (twice 5)
10
lis.py> (define repeat (lambda (f) (lambda (x) (f (f x)))))
lis.py> ((repeat twice) 10)
40
lis.py> ((repeat (repeat twice)) 10)
160
lis.py> ((repeat (repeat (repeat twice))) 10)
2560
lis.py> ((repeat (repeat (repeat (repeat twice)))) 10)
655360
lis.py> (pow 2 16)
65536.0
lis.py> (define fib (lambda (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2))))))
lis.py> (define range (lambda (a b) (if (= a b) (quote ()) (cons a (range (+ a 1) b)))))
lis.py> (range 0 10)
(0 1 2 3 4 5 6 7 8 9)
lis.py> (map fib (range 0 10))
(1 1 2 3 5 8 13 21 34 55)
lis.py> (map fib (range 0 20))
(1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987 1597 2584 4181 6765)
```

如此一来，我们的语言中就有了过程、变量、条件判断（if）和顺序执行（begin）。如果你熟悉其他语言的话，你可能会觉得我们还需要 while 或者 for 循环，但 Scheme 认为自己不需要这两种循环结构。Scheme 标准中说：“Scheme 展示了只需要极少量构造表达式的规则，无需规定表达式的组成方式，就足以构建出一个实用而高效的语言。”在 Scheme 中，我们通过构建递归函数的方式来实现迭代。

# Lispy 有多小/快/完整/好？

我们以以下的标准来评判 Lispy：

- 小：Lispy 十分简短：不算空行和注释的话一共只有 117 行，源码只有 4K 大小。（更早的一个版本只有 90 行，但包含的标准过程更少，也显得过于简陋了。）我用 Java 实现的最小 Scheme（Jscheme）包含 1664 行代码，源码有 57K 大。Jscheme 之前叫 SILK（Scheme in Fifty Kilobytes，缩写对不上...anyway），不过实际上只有在编译成 bytecode 的情况下才小于 50k。在“小”这一方面，Lispy 做得要好很多，我想它符合[Alan Kay在1972年所说的](http://gagne.homedns.org/~tgagne/earlyhistoryst.html)：“你可以用‘一页代码’定义出‘世界上最强大的语言’”。（其实我觉得 Alan Kay 本人不会同意，因为 Python 解释器的代码量远高于一页。）
- 快：Lispy 可以在 0.003 秒内计算出 (fact 100) 的值。对我来说够快了（尽管比大部分语言慢很多）。
- 完整：Lispy 和 Scheme 标准比起来算不上完整。一下是主要的一些缺少处：
	- 语法：缺少注释，quote 符和 quasiquote 符，#常量，延伸的表达式（从 if 中延伸出的 cond，从 lambda 中延伸出的 let），和 dotted list 标记。
	- 语义：缺少 call/cc 和尾递归。
	- 数据类型：缺少 String, character, boolean, ports, vectors, exact/inexact numbers。Python 的列表相比于 Scheme 里的列表实际上更接近于 Scheme 里的 vector。
	- 过程：少了 100 多种原始过程：包含与所有缺少的数据类型有关的过程，以及 set-car! 和 set-cdr! 之类的过程，因为我们没法用 Python 列表直接实现这一功能。
	- 错误修复：Lispy 不会尝试去侦测，报告以及修复错误。想用 Lispy 编程的话你需要一个从不犯错的程序员。
- 好：这项的评判就交由读者去定了。对我来说，它不错地完成了预定目标——解释 Lisp 解释器的工作原理。

**附录：完整代码**

``` python
################ Lispy: Scheme Interpreter in Python

## (c) Peter Norvig, 2010-16; See http://norvig.com/lispy.html

from __future__ import division
import math
import operator as op

################ Types

Symbol = str          # A Lisp Symbol is implemented as a Python str
List   = list         # A Lisp List is implemented as a Python list
Number = (int, float) # A Lisp Number is implemented as a Python int or float

################ Parsing: parse, tokenize, and read_from_tokens

def parse(program):
    "Read a Scheme expression from a string."
    return read_from_tokens(tokenize(program))

def tokenize(s):
    "Convert a string into a list of tokens."
    return s.replace('(',' ( ').replace(')',' ) ').split()

def read_from_tokens(tokens):
    "Read an expression from a sequence of tokens."
    if len(tokens) == 0:
        raise SyntaxError('unexpected EOF while reading')
    token = tokens.pop(0)
    if '(' == token:
        L = []
        while tokens[0] != ')':
            L.append(read_from_tokens(tokens))
        tokens.pop(0) # pop off ')'
        return L
    elif ')' == token:
        raise SyntaxError('unexpected )')
    else:
        return atom(token)

def atom(token):
    "Numbers become numbers; every other token is a symbol."
    try: return int(token)
    except ValueError:
        try: return float(token)
        except ValueError:
            return Symbol(token)

################ Environments

def standard_env():
    "An environment with some Scheme standard procedures."
    env = Env()
    env.update(vars(math)) # sin, cos, sqrt, pi, ...
    env.update({
        '+':op.add, '-':op.sub, '*':op.mul, '/':op.truediv, 
        '>':op.gt, '<':op.lt, '>=':op.ge, '<=':op.le, '=':op.eq, 
        'abs':     abs,
        'append':  op.add,  
        'apply':   apply,
        'begin':   lambda *x: x[-1],
        'car':     lambda x: x[0],
        'cdr':     lambda x: x[1:], 
        'cons':    lambda x,y: [x] + y,
        'eq?':     op.is_, 
        'equal?':  op.eq, 
        'length':  len, 
        'list':    lambda *x: list(x), 
        'list?':   lambda x: isinstance(x,list), 
        'map':     map,
        'max':     max,
        'min':     min,
        'not':     op.not_,
        'null?':   lambda x: x == [], 
        'number?': lambda x: isinstance(x, Number),   
        'procedure?': callable,
        'round':   round,
        'symbol?': lambda x: isinstance(x, Symbol),
    })
    return env

class Env(dict):
    "An environment: a dict of {'var':val} pairs, with an outer Env."
    def __init__(self, parms=(), args=(), outer=None):
        self.update(zip(parms, args))
        self.outer = outer
    def find(self, var):
        "Find the innermost Env where var appears."
        return self if (var in self) else self.outer.find(var)

global_env = standard_env()

################ Interaction: A REPL

def repl(prompt='lis.py> '):
    "A prompt-read-eval-print loop."
    while True:
        val = eval(parse(raw_input(prompt)))
        if val is not None: 
            print(lispstr(val))

def lispstr(exp):
    "Convert a Python object back into a Lisp-readable string."
    if isinstance(exp, List):
        return '(' + ' '.join(map(lispstr, exp)) + ')' 
    else:
        return str(exp)

################ Procedures

class Procedure(object):
    "A user-defined Scheme procedure."
    def __init__(self, parms, body, env):
        self.parms, self.body, self.env = parms, body, env
    def __call__(self, *args): 
        return eval(self.body, Env(self.parms, args, self.env))

################ eval

def eval(x, env=global_env):
    "Evaluate an expression in an environment."
    if isinstance(x, Symbol):      # variable reference
        return env.find(x)[x]
    elif not isinstance(x, List):  # constant literal
        return x                
    elif x[0] == 'quote':          # (quote exp)
        (_, exp) = x
        return exp
    elif x[0] == 'if':             # (if test conseq alt)
        (_, test, conseq, alt) = x
        exp = (conseq if eval(test, env) else alt)
        return eval(exp, env)
    elif x[0] == 'define':         # (define var exp)
        (_, var, exp) = x
        env[var] = eval(exp, env)
    elif x[0] == 'set!':           # (set! var exp)
        (_, var, exp) = x
        env.find(var)[var] = eval(exp, env)
    elif x[0] == 'lambda':         # (lambda (var...) body)
        (_, parms, body) = x
        return Procedure(parms, body, env)
    else:                          # (proc arg...)
        proc = eval(x[0], env)
        args = [eval(exp, env) for exp in x[1:]]
        return proc(*args)
```