---
title: Verilog 状态机学习笔记
date: 2026-08-12 10:00:00
updated: 2026-08-12 10:00:00
categories:
  - [FPGA]
  - [Verilog]
tags:
  - FPGA
  - Verilog
  - FSM
  - RTL
description: 通过一个三状态示例验证状态机文章中的标题、表格、Verilog 代码块与数学公式排版。
cover: 'linear-gradient(135deg, #0b2742 0%, #176b85 100%)'
mathjax: true
mermaid: true
---

> **示例内容**：本文只用于验证博客的技术文章排版，代码应结合具体工程重新设计和验证。

## 状态机结构

有限状态机通常可以拆成三个部分：状态寄存器、下一状态组合逻辑和输出逻辑。下面使用 `IDLE`、`RUN`、`DONE` 三个状态演示基本写法。

{% mermaid %}
stateDiagram-v2
  [*] --> IDLE
  IDLE --> RUN: start
  RUN --> DONE: finish
  DONE --> IDLE: clear
{% endmermaid %}

### 状态定义

| 状态 | 编码 | 含义 |
| --- | --- | --- |
| `IDLE` | `2'b00` | 等待启动 |
| `RUN` | `2'b01` | 执行任务 |
| `DONE` | `2'b10` | 任务完成 |

## Verilog 示例

```verilog
module simple_fsm (
    input  wire clk,
    input  wire rst_n,
    input  wire start,
    input  wire finish,
    input  wire clear,
    output reg  busy,
    output reg  done
);
  localparam IDLE = 2'b00;
  localparam RUN  = 2'b01;
  localparam DONE = 2'b10;

  reg [1:0] state;
  reg [1:0] next_state;

  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
      state <= IDLE;
    else
      state <= next_state;
  end

  always @(*) begin
    next_state = state;
    case (state)
      IDLE: if (start)  next_state = RUN;
      RUN:  if (finish) next_state = DONE;
      DONE: if (clear)  next_state = IDLE;
      default:          next_state = IDLE;
    endcase
  end

  always @(*) begin
    busy = (state == RUN);
    done = (state == DONE);
  end
endmodule
```

代码块右上角可以复制，也可以全屏查看较长的 RTL 代码。

## 时序与公式

如果时钟周期为 $T_{clk}$，一次包含 $N$ 个周期的操作，其理想执行时间可以写成：

$$
T_{run} = N \times T_{clk}
$$

离散控制中常见的 PI 表达式也可以正常显示：

$$
u(k) = K_p e(k) + K_i \sum_{i=0}^{k} e(i)
$$

## 验证检查项

1. 复位后是否稳定进入 `IDLE`。
2. 未满足转移条件时是否保持当前状态。
3. 非法状态能否回到安全状态。
4. 输出是 Moore 型还是 Mealy 型，时序是否符合接口要求。

示例只说明结构，真实工程还应加入 testbench、断言、覆盖率或板级验证结果。
