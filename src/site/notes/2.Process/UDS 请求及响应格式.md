---
{"dg-publish":true,"dg-enable-search":"true","dg-path":"文章/UDS 请求及响应格式.md","permalink":"/文章/UDS 请求及响应格式/","dgEnableSearch":"true","dgPassFrontmatter":true,"created":"2020-04-24T15:55:54.000+08:00","updated":"2023-11-17T15:55:54.000+08:00"}
---

#BDStar 

请求格式
-   SID
-   SID+SF（Sub-function）
-   SID+DID(Data Identifier)(读写用)
-   SID+SF+DID。

响应格式
-   肯定响应：SID+0x40
-   否定响应：7F+SID+NRC