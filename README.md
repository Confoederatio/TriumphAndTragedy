# Triumph & Tragedy

![](https://i.postimg.cc/KY7XcRpG/civilization-mobile-banner-2.png)

![](https://i.postimg.cc/DZfN25b6/triumph-and-tragedy-secondary-banner.png)

<div align = "center">-</div>
<br>
<img src = "https://i.postimg.cc/hjTYphY2/ctd-light-logo.png" height = "64">

[![Join our community!](https://img.shields.io/discord/548994743925997570?label=Discord&style=for-the-badge)](https://discord.gg/89kQY2KFQz) ![](https://img.shields.io/github/languages/code-size/Australis-0/TriumphAndTragedy?style=for-the-badge) ![](https://img.shields.io/github/downloads/Australis-0/TriumphAndTragedy/total?style=for-the-badge)

> We're looking for programmers! If you know JS/JSON, please get in touch!

## About

**Triumph & Tragedy** is a turn-based grand-strategy Discord bot game featuring fully automated economic, diplomatic, combat, and political mechanics. It comes with a variety of frameworks as well as a revolutionary new UI system that utilises private channels for a more seamless in-game experience.

* Brutally simple and readable
* Easy to setup
* Modding framework
* Performant

## Contributing

Anyone is welcome to contribute to Triumph & Tragedy! Although we have a variety of [official updates](https://docs.google.com/document/d/1BKCJqh4oHbGyzd0z3Zv7wa1ZYlJANipJ--YZat7OS98/edit?usp=sharing) in the works,  your feedback on these is more than welcome.

If you'd like to create a mod for Triumph & Tragedy, simply fork this repo and start editing!

If you wish to help with official updates, get in touch with `@Australis#6709` or `@Vis#5102` over Discord for information on how to become an official contributor, or simply create a new pull request.

## Data Structure

The data structure of Triumph & Tragedy is brutally simple, and separated into the following categories:

#### Main Folders:

- `common/` - All config and modding files are contained here, and formatted in JSON.
- `core/framework/data` - These contain the core game functions and parsers from common.
- `core/framework/ui` - All UI elements are put here.
- `core/game` - Contains all the command files for the game.

#### Special Files:

- `core/framework/data/turn_framework.js` is used for all turn processing.

- `core/framework/discord/command_handler.js` provides our visual prompt system, an alternative to Discord's base slash commands.
- `core/framework/discord/ui_framework.js` contains the base framework for most Discord UI elements.

- `core/framework/ui/page_handler.js` handles all buttons and commands.
- `core/framework/ui/topbar_handler.js` handles all topbar buttons (e.g. Country/Economy, etc).

- `main.js` contains the main event handlers and startup order.
- `startup.js` contains a directory of all files used in the bot and startup functions.

## Documentation

Documentation is available for modders! [Click here](https://docs.google.com/document/d/1uLfSMooByn0jtm6hfKK8rn8c9Qj9FCWv8JibFgOQwhc/edit?usp=sharing) to start reading.

The game's code is structured in a reasonable and simple way! Filenames tell you what mechanic and category they sit in, and all functions inside are automatically made global for convenience, and sorted alphabetically. The code inside tries to be as simple and readable as possible.

Feel free to dig right in!

## Help

#### Dependencies:

- **Cairo Graphics**
- **Node.js** 16.9.0+

Make sure to set up a bot client under Discord Developer Portal if you want the bot to run properly!

This bot now comes with an installation script! Simply run `installer.bat` to begin the installation process and follow each prompt thoroughly.

You can then launch the bot at anytime by running `autorun.bat`.

---

If you have any additional questions, [Join our Discord](https://discord.gg/89kQY2KFQz)! We're more than happy to help. This bot is a major undertaking, and as such we ourselves need all the help we can get!

Happy modding and coding,

-Australis & Vis
