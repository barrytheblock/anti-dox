# Barry's Anti Dox
Tampermonkey code that blurs private information on webpages to prevent accidental doxing during screenshares.

# How to setup
1. Dwnload the **anti-dox.js** file.
2. Download the Tampermonkey extension [here](https://www.tampermonkey.net/#download).
3. Once installed, open the Tampermonkey menu and click **Create new script**.
4. Import or paste the content of the javascript file.

# How to use
1. **Control + Alt + D** is the default sequence to open the menu.
2. When opened for the first time, you're prompted to create a passcode.
3. Add private information in the menu.
4. Every page with Tampermonkey supported will now have your private information blurred.

# Forgot your password?
If you forget your password, simply click **Forgot Passcode**. You'l be ask to give atleast one of your entries to verify it's you. 

Password protection is to make sure that it is you, but also prevent accidentally opening the menu and exposing your private information.

# Customize menu open keybind
Edit the value of **SHORTCUT_KEY** to change the opening keybind to your own. Below are some examples.

| Key | Value |
|---|---|
| A–Z | `KeyA`, `KeyB`, `KeyC`, ... `KeyZ` |
| 0–9 (top row) | `Digit0`, `Digit1`, ... `Digit9` |
| Numpad 0–9 | `Numpad0`, `Numpad1`, ... `Numpad9` |
| Function keys | `F1`, `F2`, ... `F12` |
| Space | `Space` |
| Tab | `Tab` |
| Backquote (`` ` ``) | `Backquote` |
| Minus (`-`) | `Minus` |
| Equal (`=`) | `Equal` |
| Brackets (`[` `]`) | `BracketLeft`, `BracketRight` |
| Backslash (`\`) | `Backslash` |
| Semicolon (`;`) | `Semicolon` |
| Quote (`'`) | `Quote` |
| Comma / Period / Slash | `Comma`, `Period`, `Slash` |
