---
{"dg-publish":true,"dg-path":"00 - 汽车电子/UDS 请求及响应格式.md","permalink":"/00 - 汽车电子/UDS 请求及响应格式/","created":"2020-04-24T15:55:54.000+08:00","updated":"2025-04-02T15:26:27.553+08:00"}
---

#BDStar #AutoSAR #UDS 

请求格式

-   SID
-   SID+SF（Sub-function）
-   SID+DID（Data Identifier）
-   SID+SF+DID。

响应格式

-   肯定响应：SID+0x40
-   否定响应：7F+SID+NRC