---
# 这是一份示例档案，draft: true 不会发布。
# 真实作品请复制本文件改名后，把 draft 去掉。
title: 作品名称
year: 2026
event: 赛事或项目名称
result: 一等奖
summary: 一句话说明这个作品做了什么。
# 开源仓库和许可单独成字段：给了 repo 就会在参数表里自动补一行「源码」，
# 给了 license 就自动补一行「许可」。上面 specs 里不用再写这两行。
repo: https://github.com/H2CO3cumt/xxx
license: MIT
specs:
  - label: 赛事
    value: 全国大学生集成电路创新创业大赛
  - label: 主控
    value: Xilinx Artix-7 XC7A35T
  - label: 系统时钟
    value: 100 MHz
  - label: 资源占用
    value: LUT 3214 / FF 2908 / BRAM 12
draft: true
---

开头一段，说清楚这个作品解决什么问题、我自己做了哪一部分。

## 结构

模块怎么切的，数据怎么流的。

<!-- 图片和这份 Markdown 放同一个目录，用相对路径引用：

     ![](./block-diagram.png)

     构建时会自动转成 webp、写入宽高、按需懒加载。开发板照片和波形截图同理。
     不要放 public/，那边不做优化。 -->

## 遇到的问题

写具体现象，别写"遇到了一些困难"。比如：时序在 120 MHz 不收敛，某条路径扇出过大。

## 结果

最终跑在多少频率、比赛成绩、仓库里放了什么。没做完的部分也写出来。
