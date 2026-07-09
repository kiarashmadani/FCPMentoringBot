# FCPMentoringBot 🤖

A Telegram bot built for the **Fundamentals of Computer Programming (FCP)** mentoring team at **IUST**, designed to streamline how students ask for help and how mentors respond — all inside a single group chat.

## The Problem

Our mentoring team supported all students taking the basic Python programming course. Without a shared system, students would message individual mentors directly whenever they had a question, which meant:

- Some mentors got overloaded with questions while others got none
- There was no visibility into who had already been helped
- Questions and answers were scattered across private chats instead of being centralized

## The Solution

FCPMentoringBot acts as a bridge between students and the mentoring team:

1. A student sends their question directly to the bot in a private chat.
2. The bot forwards that message into the mentors' Telegram group.
3. Whichever mentor is free simply **replies to the bot's forwarded message** in the group.
4. The bot relays that reply back to the original student.

No mentor has to be "on call," no question gets lost in a private DM, and every mentor can see (and jump in on) any question that comes through.

## Features

- 📨 Forwards student messages from private chat into the mentors' group automatically
- 💬 Lets any available mentor reply by simply replying to the bot's message in the group
- 🔁 Routes mentor replies back to the correct student, with no manual copy-pasting
- 👥 Enables a whole mentoring team to cover student questions without dedicating one person to support at all times
- 🇮🇷 Built to support a Persian-speaking student and mentor base

## Tech Stack

- **Node.js** / **JavaScript**
- [Telegram Bot API](https://core.telegram.org/bots/api)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- The chat ID of your mentors' Telegram group (with the bot added as a member/admin)

### Installation

```bash
git clone https://github.com/kiarashmadani/FCPMentoringBot.git
cd FCPMentoringBot
npm install
```

### Configuration

Update `bot.js` (or your environment variables, depending on your setup) with:

- Your bot's **token** from BotFather
- The **group chat ID** the bot should forward student messages to

### Running the bot

```bash
node bot.js
```

## Live

The bot is currently deployed and running on [Render](https://render.com/). You can message it directly on Telegram to see it in action.

## How It Works (Under the Hood)

- Each incoming private message is forwarded to the mentors' group, tagged with the sender's info so mentors know who's asking.
- The bot keeps track of which forwarded group message corresponds to which student.
- When a mentor replies to that specific message in the group, the bot detects the reply and sends it back to the original student — closing the loop without exposing mentors' personal accounts to students.

## Use Case

This bot was built and used for the **IUST FCP Mentoring Team**, a group of student mentors (led by a head mentor) supporting all students enrolled in the introductory Python programming course.

## Author

Built by [Kiarash Madani](https://github.com/kiarashmadani), head mentor of the IUST FCP mentoring team.

## License

Feel free to fork and adapt this for your own mentoring team or student support group.
