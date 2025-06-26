---
{"dg-publish":true,"dg-path":"02 - 软件工程/Why I Program in Lisp（为什么我用 Lisp 编程）.md","permalink":"/02 - 软件工程/Why I Program in Lisp（为什么我用 Lisp 编程）/","created":"2025-04-29T13:49:32.745+08:00","updated":"2025-06-26T09:33:30.162+08:00"}
---

#Innolight #Lisp 

Lisp is not the most popular language. It never was. Other general purpose languages are more popular and ultimately can do everything that Lisp can (if Church and Turing are correct). They have more libraries and a larger user community than Lisp does. They are more likely to be installed on a machine than Lisp is.

Lisp 从来都不是最受欢迎的编程语言。其他通用语言比它更受欢迎，而且如果丘奇和图灵的理论是正确的，那么它们最终能够完成 Lisp 能够完成的一切。它们拥有比 Lisp 更多的库和更大的用户群体，也更有可能被安装在计算机上。

Yet I prefer to program in Lisp. I keep a Lisp REPL open at all times, and I write prototypes and exploratory code in Lisp. Why do I do this? Lisp is easier to remember, has fewer limitations and hoops you have to jump through, has lower “friction” between my thoughts and my program, is easily customizable, and, frankly, more fun.

然而，我更喜欢用 Lisp 编程。我总是开着一个 Lisp 交互式编程环境（REPL），并且用 Lisp 来编写原型和探索性代码。我为什么要这么做呢？Lisp 更容易记住，限制更少，不需要经过太多复杂的步骤，我的想法和程序之间的“摩擦”更小，它很容易定制，而且，坦白说，更有趣。

Lisp's dreaded Cambridge Polish notation is uniform and universal. I don't have to remember whether a form takes curly braces or square brackets or what the operator precedency is or some weird punctuated syntax that was invented for no good reason. It is (operator operands ...) for everything. Nothing to remember. I basically stopped noticing the parenthesis 40 years ago. I can indent how I please.

Lisp 令人畏惧的剑桥波兰表示法是统一且普遍的。我不需要记住某个表达式是用大括号还是方括号，也不需要记住操作符的优先级，或者那些毫无理由发明出来的奇怪标点符号语法。它对一切表达式都是（操作符 操作数……）。没有什么需要记住的。我基本上在 40 年前就不再注意那些括号了。我可以按照我喜欢的方式进行缩进。

I program mostly functionally, and Lisp has three features that help out tremendously here. First, if you avoid side effects, it directly supports the substitution model. You can tell Lisp that when it sees this simple form, it can just replace it with that more complex one. Lisp isn't constantly pushing you into thinking imperatively. Second, since the syntax is uniform and doesn't depend on the context, you can refactor and move code around at will. Just move things in balanced parenthesis and you'll pretty much be ok.

我主要以函数式的方式编程，而 Lisp 有三个特性在这方面帮助极大。首先，如果你避免副作用，它直接支持替换模型。你可以告诉 Lisp，当它看到这个简单的表达式时，可以直接用那个更复杂的表达式替换掉它。Lisp 不会总是迫使你用命令式的方式去思考。其次，由于语法是统一的，不依赖于上下文，你可以随意重构和移动代码。只要在平衡的括号内移动代码，你基本上就没问题。

Third, in most computer languages, you can abstract a specific value by replacing it with a variable that names a value. But you can perform a further abstraction by replacing a variable that names a quantity with a function that computes a quantity. In functional programming, you often downplay the distinction between a value and a function that produces that value. After all, the difference is only one of time spent waiting for the answer. In Lisp, you can change an expression that denotes an object into an abtraction that computes an object by simply wrapping a `lambda` around it. It's less of a big deal these days, but properly working `lambda` expressions were only available in Lisp until recently. Even so, `lambda` expressions are generally pretty clumsy in other languages.

第三，在大多数计算机语言中，你可以通过将特定值替换为命名该值的变量来抽象它。但是，你可以通过将命名量的变量替换为计算量的函数来进行进一步的抽象。在函数式编程中，你常常会淡化值和产生该值的函数之间的区别。毕竟，区别只在于等待答案的时间。在 Lisp 中，你只需要在表达式周围加上一个`lambda`，就可以将表示对象的表达式变成计算对象的抽象。如今这已经不算什么大事了，但直到最近，只有 Lisp 拥有真正可用的`lambda`表达式。即便如此，其他语言中的`lambda`表达式通常都很笨拙。

Functional programming focuses on functions (go figure!). These are the ideal black box abstraction: values go in, answer comes out. What happens inside? Who knows! Who cares! But you can plug little simple functions together and get bigger more complex functions. There is no limit on doing this. If you can frame your problem as "I have this, I want that", then you can code it as a functional program. It is true that functional programming takes a bit of practice to get used to, but it allows you to build complex systems out of very simple parts. Once you get the hang of it, you start seeing everything as a function. (This isn't a limitation. Church's lambda calculus is a model of computation based on functional composition.)

函数式编程专注于函数（这不足为奇！）。函数是理想的黑箱抽象：输入值，输出答案。里面发生了什么？谁知道！谁在乎！但你可以把一些小的简单函数组合起来，得到更大更复杂的函数。这样做没有任何限制。如果你能把问题表述为“我有这个，我想要那个”，那么你就可以用函数式编程来解决它。的确，函数式编程需要一点练习才能习惯，但它允许你用非常简单的部件构建复杂的系统。一旦你掌握了它，你就会把一切都看作函数。（这不是限制。丘奇的 λ 演算是一种基于函数组合的计算模型。）

Lisp lets me try out new ideas as quickly as I can come up with them. New programs are indistinguishable from those built in to the language, so I can build upon them just as easily. Lisp's debugger means I don't have to stop everything and restart the world from scratch every time something goes wrong. Lisp's safe memory model means that bugs don't trash my workspace as I explore the problem.

Lisp 让我能够以我产生新想法的速度去尝试它们。新程序与语言内置的程序无法区分，因此我可以像使用内置程序一样轻松地在它们之上构建。Lisp 的调试器意味着每次出现问题时，我不必停下来并从头开始重新启动。Lisp 的安全内存模型意味着在探索问题时，错误不会破坏我的工作空间。

The REPL in lisp evaluates _expressions_, which are the fundamental fragments of Lisp programs. You can type in part of a Lisp program and see what it does immediately. If it works, you can simply embed the expression in a larger program. Your program takes shape in real time as you explore the problem.

Lisp 的 REPL 会评估**表达式**，这是 Lisp 程序的基本组成部分。你可以输入 Lisp 程序的一部分，并立即看到它的作用。如果它有效，你可以简单地将这个表达式嵌入到更大的程序中。你的程序会在你探索问题的过程中实时成型。

Lisp's dynamic typing gives you virtually automatic ad hoc polymorphism. If you write a program that calls +, it will work on any pair of objects that have a well-defined + operator. Now this can be a problem if you are cavalier about your types, but if you exercise a little discipline (like not defining + on combinations of strings and numbers, for example), and if you avoid automatic type coercion, then you can write very generic code that works on a superset of your data types. (Dynamic typing is a two-edged sword. It allows for fast prototyping, but it can hide bugs that would be caught at compile time in a statically typed language.) Other languages may share some of these features, but Lisp has them all together. It is a language that was designed to be used as a tool for thinking about problems, and that is the fun part of programming.

Lisp 的动态类型让你几乎可以自动地实现特设多态。如果你编写了一个调用`+`的程序，它将适用于任何一对定义了`+`操作符的对象。当然，如果你对类型很随意（例如，在字符串和数字的组合上定义`+`），或者如果你避免自动类型强制转换，那么你可以编写非常通用的代码，它适用于你数据类型的超集。（动态类型是一把双刃剑。它允许快速原型开发，但它可能会隐藏在静态类型语言中会在编译时捕获的错误。）其他语言可能有一些这样的特性，但 Lisp 把它们全部结合在一起。它是一种被设计为用于思考问题的工具的语言，而这就是编程的乐趣所在。