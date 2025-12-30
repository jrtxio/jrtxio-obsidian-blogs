---
{"dg-publish":true,"dg-path":"01 车载技术/UDS 请求及响应格式.md","permalink":"/01 车载技术/UDS 请求及响应格式/"}
---

#BDStar #AUTOSAR #UDS 

请求格式

-   SID
-   SID+SF（Sub-function）
-   SID+DID（Data Identifier）
-   SID+SF+DID。

响应格式

-   肯定响应：SID+0x40
-   否定响应：7F+SID+NRC