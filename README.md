# 🌍 Planet Smash  
### _A Location-Based Globe Defense Quiz Game built with Globe.gl & JavaScript_

---

## ⭐ Overview

**Planet Smash** is a fast-paced, location-based quiz defense game where the player must protect Earth from incoming geo-attacks.

Every question in the game is tied to real-world geographic coordinates.  
A wrong answer triggers a **laser strike** onto the correct location on the 3D globe rendered with Globe.gl.  
A correct answer empowers your hero and helps maintain Earth’s health.

Your mission: **Keep Earth alive by answering all questions correctly.**

---

## 🎮 Gameplay

### Game Flow
1. Player enters a username.
2. Selects a hero (Ceres, Juno, Mars, Venus).
3. Selects difficulty mode:
   - **Easy** → 10 questions  
   - **Normal** → 10 questions  
   - **Hard** → 10 advanced questions  
4. The battle screen loads:
   - A rotating **3D Earth** in the center  
   - A heroic character on the right  
   - Questions displayed beneath the globe  

### Answer Outcomes

#### ✔ Correct Answer
- Hero speaks an encouraging line  
- No damage to Earth  
- Next question appears  

#### ✖ Wrong Answer
- Earth takes damage  
- A laser beam (arc) shoots from the hero toward the correct location  
- A circular explosion (ring) appears on the globe  
- Hero shakes  
- Earth’s HP bar decreases  

If HP reaches **0 → Earth is destroyed**.  
If the player finishes the question pool → **Victory**.

---

## ❤️ Health & Lives System

Earth starts with **100 HP**.

Damage per wrong answer:

| Mode | Damage |
|------|--------|
| Easy | 10 HP |
| Normal | 20 HP |
| Hard | 30 HP |

HP Bar Colors:
- **Green** (100–61)
- **Yellow** (60–31)
- **Red** (30–0)

Reaching zero triggers the loss state.

---

## 🌐 Location-Based Question System

Every question contains `lat` and `lng` coordinates:

```js
{
  question: "Penguins primarily live near which continent?",
  answers: ["Africa", "Antarctica", "Europe", "Asia"],
  correct: "Antarctica",
  lat: -75,
  lng: 0
}
