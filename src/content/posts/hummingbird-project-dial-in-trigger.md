---
title: "Calling My Server Like The Hummingbird Project"
date: 2026-10-07
tags: [homelab, twilio, automation]
draft: false
project: "https://github.com/daltschu22/dial-in-trigger"
image: "images/hummingbird-project/phone-scene.jpg"
imageAlt: "The phone scene from The Hummingbird Project"
imageWidth: 1280
imageHeight: 720
---

I've been obsessed with [this scene](https://www.youtube.com/watch?v=tOLr1pkdr9Q)
in the 2018 movie *The Hummingbird Project* for a long time. Dial a phone number,
punch in a code, and execute a script on your server. Very cool.

I wanted to replicate this myself. Here's how I did it.

I used Twilio for the phone number and a small Python app to handle the call.
When someone calls, Twilio sends a request to the app's `/voice` endpoint.

## Answering the call

Twilio calls these instructions TwiML. They're XML, and this flow only needs a
few lines: play the beep, collect the digits, and send them to `/activate` when
the caller presses pound.

```xml
<Response>
  <Gather input="dtmf"
          action="https://example.com/activate?nonce=SESSION_TOKEN"
          method="POST"
          finishOnKey="#"
          timeout="10">
    <Play>https://example.com/greeting</Play>
  </Gather>
  <Hangup/>
</Response>
```

`example.com` would be your own app or server. The app generates a new
session token for each call and puts it in the callback URL.

`Play` fetches the greeting audio. I used the beep from the
[official Asterisk sound pack](https://downloads.asterisk.org/pub/telephony/sounds/).
`Gather` listens for keypad input, with up to ten seconds between digits. The
pound key submits immediately; otherwise, the timeout submits whatever was entered.

The `/activate` endpoint checks the submitted code. A match queues the script
and tells Twilio to say “Command accepted.” An incorrect code ends the call.

## Running the script

I deploy the app through Coolify, with Terraform managing the application and
its environment variables.

The Python app runs in two containers. One serves the webhooks and writes
jobs to a SQLite database. The other is a worker that reads the queue and
executes a configured script. The script is mounted into the worker container,
which runs it and records the exit status.

This keeps the call responsive even if the script takes a while. “Command
accepted” confirms that the job was queued. Completion is recorded separately.

Cloudflare Tunnel routes incoming requests to the web app. The worker
has no public endpoint.

## Checking requests

Before processing a call webhook, the app verifies its signature using Twilio's
SDK and the account's Auth Token. It also checks the account SID and destination
number. The keypad code then determines whether to queue the script.
[Twilio's webhook security documentation](https://www.twilio.com/docs/usage/webhooks/webhooks-security)
covers the signature check.

Each call gets one code attempt, and the app limits how many calls can try in
a five-minute window. Jobs are tracked by call ID so repeated callbacks don't
execute the same command twice. The worker runs a fixed script path; keypad
input is never treated as a shell command.

For testing, I used a script that writes a log entry. Calling the number and
entering the code produced the entry and a successful exit status.

## What could you do with it?

Once the call can execute a script, what it does is up to you. Wake a computer,
start a backup, turn on the lights, or trigger some other automation.

You could also record a message after entering the code and pass the audio to
the script. Describe a bug or a feature you want built, have the recording
transcribed, and hand the task to Codex or a similar coding agent. You could
hang up while it works on the code and leaves the changes for you to review.

The code and setup instructions are in
[dial-in-trigger](https://github.com/daltschu22/dial-in-trigger).

Just don't point the finger at me if you get busted in jail doing this!
