---
{"dg-publish":true,"dg-path":"03 编程语言与理论/Racket 列表、向量、集合入门指南.md","permalink":"/03 编程语言与理论/Racket 列表、向量、集合入门指南/","created":"2025-08-26T11:04:11.000+08:00","updated":"2025-11-25T15:11:40.000+08:00"}
---

#Innolight #Lisp #Racket 

在 Racket 中，列表、向量和集合是三种核心的数据结构，各有特色和适用场景。本文将带你快速掌握它们的使用方法。

# 列表 (List)

列表是 Racket 中最基础的数据结构，采用链表实现，支持异构元素。

## 基本操作

```racket
;; 创建列表
(list 1 2 3 4)           ; '(1 2 3 4)
'(1 2 3 4)               ; 同上，引用语法
(cons 1 '(2 3 4))        ; '(1 2 3 4)

;; 访问元素
(first '(1 2 3))         ; 1
(rest '(1 2 3))          ; '(2 3)
(second '(1 2 3))        ; 2
(list-ref '(1 2 3) 0)    ; 1，按索引访问

;; 判断
(empty? '())             ; #t
(list? '(1 2 3))         ; #t
```

## 常用函数

```racket
(length '(1 2 3))        ; 3
(append '(1 2) '(3 4))   ; '(1 2 3 4)
(reverse '(1 2 3))       ; '(3 2 1)
(member 2 '(1 2 3))      ; '(2 3)
(map add1 '(1 2 3))      ; '(2 3 4)
(filter even? '(1 2 3 4)); '(2 4)
```

**特点：**

- 头部插入 O(1)，随机访问 O(n)
- 适合递归处理和频繁的头部操作

# 向量 (Vector)

向量提供随机访问能力，类似数组，元素可变。

## 基本操作

```racket
;; 创建向量
(vector 1 2 3 4)         ; #(1 2 3 4)
(make-vector 4 0)        ; #(0 0 0 0)
(build-vector 4 add1)    ; #(1 2 3 4)

;; 访问和修改
(vector-ref #(1 2 3) 0)  ; 1
(vector-length #(1 2 3)) ; 3

;; 修改向量（需要可变向量）
(define v (vector 1 2 3))    ; 创建可变向量
(vector-set! v 0 9)          ; 修改第0个元素为9
v                            ; #(9 2 3)
```

## 可变性说明

```racket
;; 字面量语法创建不可变向量
#(1 2 3)                 ; 不可变
(vector 1 2 3)           ; 可变
(make-vector 4 0)        ; 可变

;; 转换
(vector->immutable-vector (vector 1 2 3))  ; 转为不可变
(vector-copy #(1 2 3))   ; 创建可变副本
```

## 常用函数

```racket
(vector->list #(1 2 3))  ; '(1 2 3)
(list->vector '(1 2 3))  ; #(1 2 3)
(vector-map add1 #(1 2 3))  ; #(2 3 4)
(vector-append #(1 2) #(3 4))  ; #(1 2 3 4)
```

**特点：**

- 随机访问 O(1)，适合需要索引访问的场景
- 可变，支持原地修改
- 内存连续，缓存友好

# 集合 (Set)

集合确保元素唯一性，支持快速成员检测。

## 基本操作

```racket
;; 创建集合
(set 1 2 3 2)            ; (set 1 2 3)
(list->set '(1 2 3 2))   ; (set 1 2 3)
(seteq 'a 'b 'c)         ; 使用eq?比较的集合

;; 基本操作
(set-member? (set 1 2 3) 2)  ; #t
(set-add (set 1 2) 3)        ; (set 1 2 3)
(set-remove (set 1 2 3) 2)   ; (set 1 3)
(set-count (set 1 2 3))      ; 3
```

## 集合运算

```racket
(set-union (set 1 2) (set 2 3))      ; (set 1 2 3)
(set-intersect (set 1 2 3) (set 2 3 4))  ; (set 2 3)
(set-subtract (set 1 2 3) (set 2))   ; (set 1 3)
(set-symmetric-difference (set 1 2) (set 2 3))  ; (set 1 3)
```

## 转换操作

```racket
(set->list (set 3 1 2))  ; '(1 2 3) 自动排序
(set-map (set 1 2 3) add1)  ; (set 2 3 4)

;; 筛选操作（通过列表转换实现）
(list->set (filter even? (set->list (set 1 2 3 4))))  ; (set 2 4)
```

**特点：**

- 元素唯一，自动去重
- 快速成员检测 O(log n)
- 支持数学集合运算

# 选择指南

| 数据结构   | 适用场景           | 主要优势         |
| ------ | -------------- | ------------ |
| **列表** | 递归处理、LISP 风格编程 | 头部操作快、函数式友好  |
| **向量** | 需要索引访问、性能敏感    | 随机访问快、内存高效   |
| **集合** | 需要去重、集合运算      | 唯一性保证、集合操作丰富 |

# 实用示例

## 数据处理流水线

```racket
;; 列表处理：筛选偶数并平方
(map (lambda (x) (* x x))
     (filter even? '(1 2 3 4 5 6)))  ; '(4 16 36)

;; 向量批处理
(define nums #(1 2 3 4 5))
(vector-map (lambda (x) (if (even? x) (* x x) x)) nums)  ; #(1 4 3 16 5)

;; 集合去重统计
(set-count (list->set '(1 2 2 3 3 3 4)))  ; 4
```

掌握这三种数据结构，你就能在 Racket 中高效地处理各种数据操作需求。选择合适的数据结构是编写高效代码的关键。