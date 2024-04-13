#!/usr/bin/env bash
# Run Xvfb, x11vnc and fluxbox and Cypress in a single CMD to ensure they're properly synchronized
export DISPLAY=":20"
Xvfb $DISPLAY -screen 0 1920x1080x16 &
x11vnc --passwd "123" -display $DISPLAY -N -forever -bg -o "/tmp/x11vnc.log" &
DISPLAY=$DISPLAY fluxbox -log /tmp/fluxbox.log &
DISPLAY=$DISPLAY cypress open /opt/tests/ --browser chrome