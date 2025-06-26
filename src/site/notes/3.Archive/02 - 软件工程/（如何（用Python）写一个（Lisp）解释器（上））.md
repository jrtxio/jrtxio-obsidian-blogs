---
{"dg-publish":true,"dg-path":"02 - 软件工程/（如何（用Python）写一个（Lisp）解释器（上））.md","permalink":"/02 - 软件工程/（如何（用Python）写一个（Lisp）解释器（上））/","created":"2024-01-04T11:28:28.000+08:00","updated":"2025-02-25T10:50:14.700+08:00"}
---

#Technomous #PLT  #Lisp 

这篇文章有两个目的：

1. 通用地介绍如何实现计算机语言的解释器。
2. 介绍如何利用 Python 实现 Lisp 方言 Scheme 的一个子集。

# Scheme 程序的语法和语义

一门语言的语法（syntax）指的是字母排列成正确表达式或声明的顺序；语义（semantics）则是这些表达式或声明的意义。例如在数学和许多编程语言之中，一加二的语法是“1 + 2”， 语义则是将加法运算符应用于数字 1 和 2 之上，得到结果 3。我们将计算表达式的值称之为求值（evaluating）；“1 + 2” 求值得到结果3，我们将之记为 “1 + 2” => 3。

Scheme 的语法与你熟悉的大部分语言不同。例如：

``` java
// Java
if (x.val() > 0) { 
  fn(A[i] + 1, 
     return new String[] {"one", "two"}); 
}
```

``` scheme
;; Scheme
(if (> (val x) 0) 
    (fn (+ (aref A i) 1) 
        (quote (one two)))
```

Java 有大量不同的语法约规（关键字、中置操作符、三种括号、操作符优先级、点、引号、逗号、分号等等），而 Scheme 的语法则简单很多：

- Scheme 程序中只有表达式。表达式和声明之间并无区别。
- 数字（例如 1）和符号（例如 A）被称之为原子表达式（atomic expression）；他们无法被拆分成更小的表达式。这部分和 Java 类似，但在 Scheme 中，诸如 + 和 > 这种操作符也被认为是符号（symbol），处理方式与 A 或是 fn 这种符号别无二致。
- 除此之外的一切都是列表表达式（list expression）：以“(”为首，“)”为尾，中间包括着零个或更多表达式。列表的第一个元素决定了它的含义：
- 若第一个元素是关键字，例如 (if ...)，那这个列表是一个特殊形式（special form）；特殊形式的意义取决于关键字。
- 若第一个元素并非关键字，例如 (fn ...)，那这个列表则是函数调用。

Scheme 之美在于她的简洁性：整个语言由 5 个关键字和 8 个语法形式构成。相较之下，Python 有 33 个关键字和 110 个语法形式，Java 有 50 个关键字和 133 个语法形式。Scheme 中的大量括号初看起来可能显得古怪陌生，但括号为 Scheme 提供了简洁性和一致性。（有些人开玩笑说 Lisp 的意思是“大量又蠢又烦的括号（Lots of Irritating Silly Parentheses）”；我觉得应该是“Lisp拥有纯净的语法（Lisp Is Syntactically Pure）。”）

在这篇文章中我们会涉及到 Scheme 中所有的关键点（除了一些琐碎的细节）。但罗马城不是一天建成的，我们需要分两步。首先，我们会定义一个相对简单的语言，再在它的基础上定义一个几近完整的 Scheme 语言。

# 1 号语言：Lispy 计算器

Lispy 计算器是 Scheme 语言的一个子集，它只包含五种语法形式（两种原子，两个特殊形式，以及过程调用）。只要你习惯了 Lisp 前置运算符的古怪语法，你就能利用 Lispy 计算器干一般计算器的活。你还能干一般计算器干不了的活：使用 "if" 表达式进行条件判断以及定义新的变量。我们来举个例子，以下是一个计算圆面积的程序，圆的半径为 10，计算公式为 πr^2：

``` scheme
(begin
    (define r 10)
    (* pi (* r r)))
```

下面这张表列举了所有可用的语法形式：

![Pasted image 20240104113113.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240104113113.png)

在表中“语法”一列中，var 必须为一个符号，number 必须为一个整数或浮点数，其他斜体字可以是任何表达式。其中的“arg...”表示零个或更多个"arg"。在“真正”的 Scheme 中，begin 是一个语法关键字，但在这个 Scheme 实现中，它只是一个普通的函数。

# 语言解释器做些什么？

一个计算机语言的解释器分为两部分：

1. **分析(parse)**：解释器的分析部分将程序以一串字符的形式读入，依照语法规则（syntactic rules）验证其正确性并将程序转换成一种内部表达形式。在一个简单的解释器中，内部表达形式是一个树形结构，人们一般将其称之为抽象语法树（abstract syntax tree）。抽象语法树的结构和程序中层层嵌套的声明及表达式非常相近，几乎可以说是完美对应。在编译器之中往往存在多个内部表达形式，一开始先转换成抽象语法树，随后再转换成可以直接被计算器执行的指令序列。Lispy 的语法分析器由 parse 函数实现。
2. **执行(execution)**：内部表达形式被按照语言的语法规则进行处理，以此来进行计算。Lispy 的执行函数叫做 eval（注意，这会覆盖 Python 的同名内置函数）。

以下是对解释器工作流程的一个简单的演示：

``` text
程序 ---> [parse] ---> 抽象语法树 ---> [eval] ---> 结果
```

下面这个例子则展示了我们希望 eval 和 parse 实现的功能：

``` text
>> program = "(begin (define r 10) (* pi (* r r)))"

>>> parse(program)
['begin', ['define', 'r', 10], ['*', 'pi', ['*', 'r', 'r']]]

>>> eval(parse(program))
314.1592653589793
```

# 分析：parse, tokenize 以及 read_from_tokens

依照传统，分析被分为两个部分:

1. 词法分析（lexical analysis）：在这一部分中，输入的字符串被拆分为一系列的 token。
2. 语法分析（syntactic analysis）：将 token 汇编为抽象语法树。

Lispy token 们由括号，符号和数字组成。由许多用来进行词法分析的工具（例如 Mike Lesk 和 Eric Schmidt 写的 lex），但我们只需要用到一个十分简单的工具：Python 的 str.split 函数。tokenize 函数接受一个字符串，并在括号周围加上空格；随后调用 str.split 来得到一个由 token 组成的列表：

``` python
def tokenize(chars):
    "将字符串转换成由token组成的列表。"
    return chars.replace('(', ' ( ').replace(')', ' ) ').split()
>>> program = "(begin (define r 10) (* pi (* r r)))"
>>> tokenize(program)
['(', 'begin', '(', 'define', 'r', '10', ')', '(', '*', 'pi', '(', '*', 'r', 'r', ')', ')', ')']
```

我们的 parse 函数接收一个字符串作为输入，然后调用 tokenize 函数获得一个由 token 组成的列表，再调用 read_from_tokens 来将 token 列表汇编成抽象语法树。read_from_token 函数会查看第一个 token，如果是“)”，那就报出一个语法错误。如果是“(”，那我们就开始构建一个由子表达式组成的列表，直到匹配到对应的“)”。所有非括号的 token 必须是符号或者数字。我们会让 Python 来识别它们之间的区别：对任何一个非括号 token，先尝试将之转为整数，若失败则尝试转为浮点数，若还是失败，则转为符号。下边是 parser 的代码：

``` python
def parse(program):
    "从字符串中读取Scheme表达式"
    return read_from_tokens(tokenize(program))

def read_from_tokens(tokens):
    "从一串token之中读取表达式"
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
    "数字转为对应的Python数字，其余的转为符号"
    try: return int(token)
    except ValueError:
        try: return float(token)
        except ValueError:
            return Symbol(token)
```

parse 函数的工作方式如下：

``` text
>>> program = "(begin (define r 10) (* pi (* r r)))"

>>> parse(program)
['begin', ['define', 'r', 10], ['*', 'pi', ['*', 'r', 'r']]]
```

我们还需要决定一下各种 Scheme 对象在 Python 中的表示方法：

``` python
Symbol = str          # Scheme符号由Python str表示
List   = list         # Scheme列表由Python list表示
Number = (int, float) # Scheme数字由Python的整数或浮点数表示
```

好了！定义 eval 的准备工作基本都做好了。但我们需要先了解更多的概念。

## 环境(Environments)

eval 函数接受两个参数：一个我们想要求值的表达式 x，还有一个环境 env，x 将在这个环境中被求值。环境指的是变量名和他们的值之间的映射。eval 默认会使用全局环境（global environment）进行求值，全局环境包含着一系列的标准函数（比如sqrt, max和 * 这类操作符）。这一环境可以用用户定义的变量拓展，语法为 (define variable value)。我们可以用 Python 自带的字典来实现环境，字典中的键对为 {变量: 值} 的形式。

``` python
import math
import operator as op

Env = dict          # 环境是{变量: 值}之间的映射

def standard_env():
    "一个包含着一些Scheme标准过程的环境。"
    env = Env()
    env.update(vars(math)) # sin, cos, sqrt, pi, ...
    env.update({
        '+':op.add, '-':op.sub, '*':op.mul, '/':op.div, 
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

global_env = standard_env()
```

# 求值：eval

现在，我们已经做好了实现 eval 函数的准备。来让我们重新看一遍 Lispy 计算器的语法形式表以加深一下记忆：

![Pasted image 20240104113345.png|450](/img/user/0.Asset/resource/Pasted%20image%2020240104113345.png)

来和 eval 的代码对比一下，是不是觉得很像？

``` python
def eval(x, env=global_env):
    "对在某个环境下的表达式进行求值"
    if isinstance(x, Symbol):      # 变量引用
        return env[x]
    elif not isinstance(x, List):  # 字面常量
        return x                
    elif x[0] == 'if':             # 条件
        (_, test, conseq, alt) = x
        exp = (conseq if eval(test, env) else alt)
        return eval(exp, env)
    elif x[0] == 'define':         # 定义
        (_, var, exp) = x
        env[var] = eval(exp, env)
    else:                          # 过程调用
        proc = eval(x[0], env)
        args = [eval(arg, env) for arg in x[1:]]
        return proc(*args)
```

搞定！来试试吧：

``` text
>>> eval(parse("(define r 10)"))
>>> eval(parse("(* pi (* r r))"))
314.1592653589793
```

# 交互：来做一个 REPL

一直打“eval(parse(...))”的话即便是耐心再好的人也会嫌烦。Lisp 最伟大的遗产之一就是引入了 read-eval-print loop（读取-求值-输出 循环，缩写为 REPL，译者注）。运用 REPL，程序员们可以即时地读取、求值、输出，而不用麻烦地先编译再运行。我们先定义一个名为 repl 的函数以实现这个功能，然后再定义一个 schemestr 函数来输出 Scheme 对象的字符串表示。

``` python
def repl(prompt='lis.py> '):
    "REPL的懒人实现。"
    while True:
        val = eval(parse(raw_input(prompt)))
        if val is not None: 
            print(schemestr(val))

def schemestr(exp):
    "将一个Python对象转换回可以被Scheme读取的字符串。"
    if isinstance(exp, List):
        return '(' + ' '.join(map(schemestr, exp)) + ')' 
    else:
        return str(exp)
```

老样子，做完以后来试试：

``` text
>>> repl()
lis.py> (define r 10)
lis.py> (* pi (* r r))
314.159265359
lis.py> (if (> (* 11 11) 120) (* 7 6) oops)
42
lis.py> 
```

这一章中，我们实现了一个简单的 Lisp 计算器，在[[3.Archive/02 - 软件工程/（如何（用Python）写一个（Lisp）解释器（下））\|下半部分]]中，我们将在此基础上写一个更完整的 Scheme 解释器。