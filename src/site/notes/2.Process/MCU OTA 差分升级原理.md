---
{"dg-publish":true,"dg-path":"文章/MCU OTA 差分升级原理.md","permalink":"/文章/MCU OTA 差分升级原理/","dgEnableSearch":"true","created":"2022-07-15T15:42:26.000+08:00","updated":"2023-11-20T13:38:24.350+08:00"}
---

#Ofilm 

差分烧写只是改变新的 APP 和旧的 APP 不一样的地方，FBL 直接擦除旧的 APP，烧入新的 APP。升级的时候需要在 OTA 主机或者电脑端做好差分升级包，MCU 的 BOOTLOADER 擦除时不要擦全部，只擦和差分升级相关的地址，需要注意 FLASH 擦除有最小单位限制，所以在制作差分升级包的时候需要注意一下。