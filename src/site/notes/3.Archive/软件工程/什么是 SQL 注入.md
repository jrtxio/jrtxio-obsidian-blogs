---
{"dg-publish":true,"dg-path":"软件工程/什么是 SQL 注入.md","permalink":"/软件工程/什么是 SQL 注入/","created":"2024-11-15T14:53:34.074+08:00","updated":"2024-11-18T10:53:25.622+08:00"}
---

#Innolight

[Carl Zhang’s Blog](https://carlzhang.net/)是我一个大学朋友的博客，整个平台都是他自己写的静态。在前几天，他的网站通过一个内建的 SQL 数据库实现了文章搜索功能，这篇文章将会通过对这个功能的实现来谈一谈网站的安全问题。

[静态站点如何实现站内搜索](https://carlzhang.net/technology/blog_site_search.html) 这是他关于实现搜索功能的博客，其中介绍了通过一个爬虫抓取自己网站的所有界面生成一个列表，通过列表转换成 SQL 数据库，然后通过 PHP 对生成的数据库进行查找。

# 什么是数据库

小白可能不知道什么是数据库，那么这里通俗的讲解一下，数据库就和 Office 中的 Excel 类似，文件名就是数据库的名字，一个数据库可以包含很多表，下图有两个，分别是商品和用户，每个表都由不同的字段组成。

![Pasted image 20241115150202.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115150202.png)

现在大多数的关系型数据库数据库解决方案是 MySQL 和 MSSQL，分别属于 Oracle 和微软，MikeTech 的背后就使用了 MySQL 数据库。

# SQL: 结构化查询语言

数据库的功能无非就是四个：增，删，改，查。一般操作数据库使用的是 SQL 语言。我们可以利用编程语言让数据库执行不同的 SQL 语句来操作数据库。举个例子，如果想查询上面的商品表中所有名称是 iPhone 7 的商品，应该怎么构造一个查询语句呢？

``` sql
SELECT * FROM 商品 WHERE 名称 = ‘iPhone 7’
```

就是这么简单，这样就能查询出来商品表中所有名称为 iPhone 7 的商品了。如果想要名称中只要包含 iPhone 7 就算数呢，即搜索 iPhone 7 出来 iPhone 7 和 iPhone 7 plus：

``` sql
SELECT * FROM 商品 WHERE 名称 LIKE ‘%iPhone 7%’
```

使用 LIKE 语句就可以了，是不是很简单。

> [!WARNING]
> 这里有一个地方需要注意，搜索的时候商品名称都用单引号括起来了，这样是为了避免空格切断语句。

看一看他博客中的负责搜索的代码：

![Pasted image 20241115150303.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115150303.png)

在代码第二行拼凑了 SQL 查询语句，其中 keyword 参数是用户在搜索框中输入的词汇，执行这个语句会找出 summary 字段和 title 字段中包含搜索关键字的文章。 构造出 SQL 语句之后，他的代码直接调用了 mysql_query() 函数来让数据库执行这个命令，这个做法起始是非常危险的。

先来看看正常情况，我在他博客的搜索框中输入 “峰区” ，网站真的给我返回了所有带峰区字样的文章，没毛病：

![Pasted image 20241115150328.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115150328.png)

这时执行的 SQL 语句为

``` sql
SELECT * FROM 表名 WHERE summary LIKE ‘%峰区%’ OR title LIKE ‘%峰区%’
```

其中表名是我不知道的。。。知道了可能就出事了，summary 和 title 字段是我看他博客里写的所以应该没有问题。

那我再输入点畸形的“ 峰区 ”（前后加入若干空格），结果还是一样的，那是因为他的程序在前面对用户的输入做了一个 trim 处理，删除了前后所有的空格，所以最后执行的 SQL 语句结果还是一样的。

# SQL 注入(SQL Injection)

可是如果我输入的不是“峰区”这样正常的字眼而是别的？这便是攻击网站的方法中的一种 —— SQL 注入。

在设计程序的过程中，只要牵扯到用户输入，那么我都会记住一点：“永远不要相信用户的输入”。

由于程序没有对我输入什么做更多处理，那么要是打一段 SQL 语句在搜索框里会出现怎样的情况呢？这次来输入 单引号 “ ‘ ” 试一试：

![Pasted image 20241115150436.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115150436.png)

这已经说明 SQL 语句在执行中出现了故障，为什么呢？来看一看：

![Pasted image 20241115150834.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115150834.png)

由于我输入了一个单引号，拼接后的 SQL 语句因为我的单引号和语句中原本的单引号造成了闭合，这让黑色部分成了有效的部分。而红色部分，由于多出来的百分号导致出现了语法错误，所以这条命令无法执行。

再来试一试输入：“ a’ or 1=1 - - a ”

![Pasted image 20241115150859.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115150859.png)

这个输入直接列出了数据库中所有的文章，来看看原因：

![Pasted image 20241115150934.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115150934.png)

SQL 语句变成了这样，其中 ，两个减号 - - 是 SQL 的注释语法，在之后的语句是不会被执行的，所以 SQL 语句相当于变成了这样：

``` sql
SELECT * FROM 表名 WHERE summary LIKE ‘%a’ or 1=1
```

根据语句的意思，应该是列举出所有 summary 字段 中包含 %a 字样的列，但是后面多了一句 or 1=1，1=1 是一个恒为真的表达式，通过和 OR（逻辑或）语句联合使用，最后相当于执行了:

``` sql
SELECT * FROM 表名 WHERE 1
```

所以数据库列出了所有的文章。

再来试一试 ” a’ or 1 = 1 LIMIT 1; — a “ 通过 Limit 语法限制一下检索结果的最大数量为 1, 从结果来看没问题。

![Pasted image 20241115150947.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115150947.png)

这就是最基本的 SQL 注入攻击，这一类漏洞可以允许用户直接在数据库中执行自己的 SQL 语句。如果我知道了表名的话后果会更严重，甚至可以直接删除这张表。

![Pasted image 20241115151008.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115151008.png)

但是我不知道表名，在没有更多线索之前只能盲猜。

这一类 SQL 注入漏洞是可能对网站造成严重后果的，如果有黑客通过漏洞知道了用户表的名字，然后黑客就可以直接获得管理员密码或者在网站中直接加入一个新的管理员，所以在设计这一类带有表单提交功能的时候要注意防范。

知道 SQL 注入的人不在少数，稍微懂点网络开发的人都会知道防范。还记得以前网络上流传过这样的图片，现在能看懂了吧~

![Pasted image 20241115151025.png|650](/img/user/0.Asset/resource/Pasted%20image%2020241115151025.png)
