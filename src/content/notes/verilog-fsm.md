---
title: Verilog 状态机学习笔记
date: 2026-08-12
summary: 用三个状态把 FSM 的写法过一遍，附带检查清单。
tags:
  - Verilog
  - FSM
  - RTL
---

有限状态机通常拆成三块：状态寄存器、下一状态组合逻辑、输出逻辑。下面用 `IDLE`、`RUN`、`DONE` 三个状态走一遍。

转移关系是这样的：复位后停在 `IDLE`；`start` 拉高进 `RUN`；`finish` 拉高进 `DONE`；`clear` 拉高回 `IDLE`。其余情况下保持当前状态。

## 状态定义

| 状态 | 编码 | 含义 |
| --- | --- | --- |
| `IDLE` | `2'b00` | 等待启动 |
| `RUN` | `2'b01` | 执行任务 |
| `DONE` | `2'b10` | 任务完成 |

还有 `2'b11` 这个非法态。综合工具一般会把它优化掉，但在仿真里它可能出现，所以 `case` 里留了 `default`。

## 写法

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

  // 状态寄存器：只有这里用非阻塞赋值
  always @(posedge clk or negedge rst_n) begin
    if (!rst_n)
      state <= IDLE;
    else
      state <= next_state;
  end

  // 下一状态：纯组合，别在这里塞别的逻辑
  always @(*) begin
    next_state = state;
    case (state)
      IDLE: if (start)  next_state = RUN;
      RUN:  if (finish) next_state = DONE;
      DONE: if (clear)  next_state = IDLE;
      default:          next_state = IDLE;
    endcase
  end

  // 输出：Moore 型，只看当前状态
  always @(*) begin
    busy = (state == RUN);
    done = (state == DONE);
  end
endmodule
```

三个 `always` 块各管一件事。段式写法比单块写起来长，但改状态转移的时候不用回头看输出逻辑。

## 时序与公式

时钟周期为 $T_{clk}$，一次包含 $N$ 个周期的操作，理想执行时间是

$$
T_{run} = N \times T_{clk}
$$

离散控制里常见的 PI 表达式：

$$
u(k) = K_p e(k) + K_i \sum_{i=0}^{k} e(i)
$$

实际工程里还得加上复位、跨时钟域同步和路径延迟，上面只是理想值。

## 验证清单

1. 复位后是否稳定进入 `IDLE`，而不是停在 `2'bxx`。
2. 转移条件不满足时，状态是否保持不变。
3. 非法状态能否回到安全状态。
4. 输出是 Moore 还是 Mealy，时序是否符合接口要求。
5. 复位释放的时机和时钟边沿有没有竞争。

这份笔记只说明了结构。真实工程还要配 testbench、断言和覆盖率，最后以上板结果为准。
