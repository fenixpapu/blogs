---
authors:
  - PaPu
categories:
  - general
date: 2023-04-04
draft: false
---

# Turn off fn moe keyboard in ubuntu

- Mình dùng phím cơ và nó có cái `Fn` mỗi tội default turn on, nên mỗi khi debug thay vì vì `F5` bật chế độ debug trên vscode thì nó hiển thì cái đèn bàn phím , hay F11 là giảm âm lượng. Nên bài này về việc tắt nó đi :D

<!-- more -->

## Turn off

- Commands:

```linenums="1"
echo 0 | sudo tee /sys/module/hid_apple/parameters/fnmode
echo options hid_apple fnmode=0 | sudo tee -a /etc/modprobe.d/hid_apple.conf
```

- Detail:

  - Hiểu về các giá trị:

    | Value |   Function   | Description                                                       |
    | :---: | :----------: | :---------------------------------------------------------------- |
    |   0   |   diabled    | Tắt function                                                      |
    |   1   | f keys last  | `F*` dùng tính năng `function`. `Fn + F*` để dùng các phím F\*    |
    |   2   | f keys first | `F*` dùng như bình thường. `Fn + F*` để dùng tính năng `function` |

  - `echo 0 | sudo tee /sys/module/hid_apple/parameters/fnmode` set tạm thời về giá trị 0
  - `echo 1 | sudo tee /sys/module/hid_apple/parameters/fnmode` để set về 1 nếu muốn.
  - `echo options hid_apple fnmode=0 | sudo tee -a /etc/modprobe.d/hid_apple.conf` để các lần sau khi restart máy vẫn là giá trị 0.
  - Chi tiết hơn ở [đây](https://help.ubuntu.com/community/AppleKeyboard#Change_Function_Key_behavior)
