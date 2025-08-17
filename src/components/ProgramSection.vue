<template>
  <section class="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
    <div class="max-w-7xl mx-auto">
      <!-- Section title -->
      <div class="text-center mb-16">
        <h2 class="text-5xl md:text-6xl font-bold mb-4" style="font-family: 'Playfair Display', serif; color: #D4AF37;">
          <i class="fas fa-scroll mr-4 text-orange-500"></i>
          ЧЕТЫРЕ ДНЯ СУДЬБЫ
          <i class="fas fa-dice-d6 ml-4 text-orange-500"></i>
        </h2>
        <p class="text-xl text-gray-300 font-mono">
          Каждая карта раскрывает тайны предстоящих ритуалов...
        </p>
      </div>

      <!-- Game cards grid -->
      <div class="flex flex-wrap justify-center gap-8 mb-16">
        <div v-for="(day, index) in gameDays" :key="day.day" 
             class="inscryption-card-container"
             :style="{ '--animation-delay': `${index * 0.3}s` }">
          
          <div class="inscryption-game-card" @click="selectCard(day)">
            <!-- Card name header -->
            <div class="card-name-section">
              <div class="card-name">{{ day.cardName }}</div>
            </div>

            <!-- Main creature artwork area -->
            <div class="card-artwork-area">
              <!-- Creature portrait -->
              <div class="creature-portrait">
                <i :class="day.creatureIcon" class="creature-icon"></i>
                
                <!-- Decorative frame -->
                <div class="portrait-frame">
                  <div class="frame-corner top-left"></div>
                  <div class="frame-corner top-right"></div>
                  <div class="frame-corner bottom-left"></div>
                  <div class="frame-corner bottom-right"></div>
                </div>
              </div>

              <!-- Creature name -->
              <div class="creature-name">{{ day.creatureName }}</div>
            </div>

            <!-- Bottom stats section -->
            <div class="card-stats-section">
              <div class="stat-box attack">
                <div class="stat-value">{{ day.activities }}</div>
                <div class="stat-icon">⚔</div>
              </div>

              <div class="card-cost">
                <div class="cost-value">{{ day.day }}</div>
              </div>

              <div class="stat-box health">
                <div class="stat-value">{{ day.mysticalPower }}</div>
                <div class="stat-icon">❤</div>
              </div>
            </div>

            <!-- Card decorative elements -->
            <div class="card-decorations">
              <div class="deco-symbol top">{{ day.topSymbol }}</div>
              <div class="deco-symbol bottom">{{ day.bottomSymbol }}</div>
              <div class="vintage-stain stain-1"></div>
              <div class="vintage-stain stain-2"></div>
              <div class="vintage-stain stain-3"></div>
            </div>

            <!-- Hover details overlay -->
            <div class="card-details-overlay">
              <div class="details-content">
                <h3>{{ day.cardName }}</h3>
                <div class="ritual-list">
                  <div v-for="ritual in day.rituals" :key="ritual" 
                       class="ritual-item">
                    <i class="fas fa-skull mr-2"></i>
                    {{ ritual }}
                  </div>
                </div>
                <div class="mystical-description">
                  "{{ day.mysticalDescription }}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Game board style timeline -->
      <div class="game-board-section">
        <div class="board-title">
          <h3>ВРЕМЕННАЯ ШКАЛА РИТУАЛОВ</h3>
        </div>
        
        <div class="timeline-board">
          <div v-for="(event, index) in timelineEvents" :key="index"
               class="timeline-slot"
               :style="{ '--slot-delay': `${index * 0.2}s` }">
            <div class="slot-content">
              <div class="time-marker">{{ event.time }}</div>
              <div class="event-icon">
                <i :class="event.icon"></i>
              </div>
              <div class="event-name">{{ event.event }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning inscription -->
      <div class="warning-inscription">
        <div class="inscription-border">
          <div class="inscription-text">
            <i class="fas fa-exclamation-triangle mr-3"></i>
            ВНИМАНИЕ: ПРОГРАММА МОЖЕТ ИЗМЕНЯТЬСЯ ПО ВОЛЕ ДРЕВНИХ СИЛ
            <i class="fas fa-eye ml-3"></i>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface GameDay {
  day: number
  cardName: string
  creatureName: string
  creatureIcon: string
  activities: number
  mysticalPower: number
  topSymbol: string
  bottomSymbol: string
  rituals: string[]
  mysticalDescription: string
}

interface TimelineEvent {
  time: string
  event: string
  icon: string
}

const selectedCard = ref<GameDay | null>(null)

const gameDays: GameDay[] = [
  {
    day: 1,
    cardName: "ПРИЗЫВАТЕЛЬ",
    creatureName: "Душа Новичка",
    creatureIcon: "fas fa-campfire",
    activities: 4,
    mysticalPower: 1,
    topSymbol: "◆",
    bottomSymbol: "◇",
    rituals: [
      "Прибытие в священный лес",
      "Заселение в убежища",
      "Ритуал знакомства у костра",
      "Первые карточные испытания"
    ],
    mysticalDescription: "Когда души впервые ступают на древнюю землю, лес пробуждается..."
  },
  {
    day: 2,
    cardName: "ВОИН КАРТ",
    creatureName: "Мастер Судьбы",
    creatureIcon: "fas fa-skull-crossbones",
    activities: 5,
    mysticalPower: 3,
    topSymbol: "▲",
    bottomSymbol: "▼",
    rituals: [
      "Великий турнир карт",
      "Мастер-классы темных искусств",
      "Ночная охота за артефактами",
      "Легенды у пламени",
      "Тайные соревнования"
    ],
    mysticalDescription: "В день битвы карты сами выбирают достойных победителей..."
  },
  {
    day: 3,
    cardName: "ОЧИСТИТЕЛЬ",
    creatureName: "Дух Воды",
    creatureIcon: "fas fa-spa",
    activities: 4,
    mysticalPower: 2,
    topSymbol: "●",
    bottomSymbol: "○",
    rituals: [
      "Священная баня-палатка",
      "Алхимия барных эликсиров",
      "Хоррор при свечах",
      "Лунные прогулки духов"
    ],
    mysticalDescription: "Вода смывает все грехи, но оставляет самые яркие воспоминания..."
  },
  {
    day: 4,
    cardName: "ХРАНИТЕЛЬ",
    creatureName: "Память Вечная",
    creatureIcon: "fas fa-camera-retro",
    activities: 3,
    mysticalPower: 5,
    topSymbol: "✦",
    bottomSymbol: "✧",
    rituals: [
      "Запечатление душ",
      "Обмен священными символами",
      "Разрушение временного убежища"
    ],
    mysticalDescription: "Финальная карта завершает круг, но история продолжается..."
  }
]

const timelineEvents: TimelineEvent[] = [
  { time: "16:00", event: "ПРИБЫТИЕ", icon: "fas fa-door-open" },
  { time: "20:00", event: "КОСТЕР", icon: "fas fa-fire" },
  { time: "00:00", event: "МИСТЕРИИ", icon: "fas fa-moon" },
  { time: "12:00", event: "ТУРНИРЫ", icon: "fas fa-trophy" },
  { time: "18:00", event: "ОМОВЕНИЕ", icon: "fas fa-tint" },
  { time: "22:00", event: "ХОРРОР", icon: "fas fa-ghost" }
]

const selectCard = (day: GameDay) => {
  selectedCard.value = day
  console.log(`🎴 Выбрана карта: ${day.cardName}`)
}
</script>

<style scoped>
/* Inscryption card containers */
.inscryption-card-container {
  animation: cardAppear 0.8s ease-out var(--animation-delay) both;
}

.inscryption-game-card {
  width: 280px;
  height: 420px;
  position: relative;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  /* Main card background - vintage paper */
  background: 
    linear-gradient(145deg, #F4E4BC 0%, #E6D3A3 25%, #D4C5A0 50%, #C9B896 75%, #B8A082 100%);
  
  /* Thick black border like in Inscryption */
  border: 6px solid #2C1810;
  border-radius: 16px;
  
  /* Vintage card shadows */
  box-shadow: 
    0 12px 24px rgba(0, 0, 0, 0.6),
    inset 0 2px 4px rgba(255, 255, 255, 0.3),
    inset 0 -2px 8px rgba(139, 69, 19, 0.4);
  
  /* Paper texture overlay */
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(101, 67, 33, 0.08) 0%, transparent 40%),
    linear-gradient(45deg, transparent 48%, rgba(0, 0, 0, 0.02) 49%, rgba(0, 0, 0, 0.02) 51%, transparent 52%);
  background-size: 60px 60px, 80px 80px, 4px 4px;
}

.inscryption-game-card:hover {
  transform: translateY(-8px) rotateX(5deg) rotateY(2deg) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.8),
    inset 0 4px 8px rgba(255, 255, 255, 0.4),
    inset 0 -4px 12px rgba(139, 69, 19, 0.5);
}

/* Card name section */
.card-name-section {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 4px solid #2C1810;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(139, 69, 19, 0.1) 100%);
  position: relative;
}

.card-name {
  font-family: 'Source Code Pro', monospace;
  font-size: 16px;
  font-weight: bold;
  color: #2C1810;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
}

/* Main artwork area */
.card-artwork-area {
  height: 240px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.creature-portrait {
  width: 160px;
  height: 160px;
  background: 
    linear-gradient(135deg, #E6D3A3 0%, #D4C5A0 50%, #C9B896 100%);
  border: 4px solid #2C1810;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 16px;
  
  /* Inner shadow for depth */
  box-shadow: 
    inset 0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 -2px 4px rgba(255, 255, 255, 0.2);
}

.creature-icon {
  font-size: 64px;
  color: #2C1810;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4));
  z-index: 2;
  position: relative;
}

.portrait-frame {
  position: absolute;
  inset: 8px;
  border: 2px solid #654321;
  border-radius: 6px;
  pointer-events: none;
}

.frame-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #2C1810;
}

.frame-corner.top-left {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.frame-corner.top-right {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
}

.frame-corner.bottom-left {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
}

.frame-corner.bottom-right {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

.creature-name {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: bold;
  color: #2C1810;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
}

/* Stats section */
.card-stats-section {
  height: 80px;
  border-top: 4px solid #2C1810;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(139, 69, 19, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: relative;
}

.stat-box {
  width: 50px;
  height: 50px;
  background: #2C1810;
  border: 3px solid #654321;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stat-box.attack {
  background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%);
}

.stat-box.health {
  background: linear-gradient(135deg, #006400 0%, #32CD32 100%);
}

.stat-value {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.stat-icon {
  font-size: 12px;
  margin-top: 2px;
  opacity: 0.8;
}

.card-cost {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: 
    radial-gradient(circle, #FFD700 0%, #FFA500 70%, #FF8C00 100%);
  border: 3px solid #2C1810;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.cost-value {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: bold;
  color: #2C1810;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

/* Decorative elements */
.card-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.deco-symbol {
  position: absolute;
  font-size: 20px;
  color: #654321;
  opacity: 0.6;
  font-weight: bold;
}

.deco-symbol.top {
  top: 15px;
  right: 15px;
}

.deco-symbol.bottom {
  bottom: 15px;
  left: 15px;
}

.vintage-stain {
  position: absolute;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 50%;
}

.vintage-stain.stain-1 {
  width: 30px;
  height: 20px;
  top: 25%;
  left: 10%;
  transform: rotate(-15deg);
}

.vintage-stain.stain-2 {
  width: 25px;
  height: 25px;
  top: 60%;
  right: 15%;
  transform: rotate(25deg);
}

.vintage-stain.stain-3 {
  width: 20px;
  height: 35px;
  bottom: 20%;
  left: 20%;
  transform: rotate(-30deg);
}

/* Hover details overlay */
.card-details-overlay {
  position: absolute;
  inset: 6px;
  background: 
    linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(44, 24, 16, 0.98) 100%);
  border-radius: 10px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.inscryption-game-card:hover .card-details-overlay {
  opacity: 1;
  transform: scale(1);
}

.details-content h3 {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: #FFD700;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.ritual-list {
  margin-bottom: 16px;
}

.ritual-item {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #E6D3A3;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.mystical-description {
  font-family: 'Playfair Display', serif;
  font-size: 11px;
  color: #D4AF37;
  font-style: italic;
  line-height: 1.4;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* Game board timeline */
.game-board-section {
  margin-top: 60px;
  padding: 40px;
  background: 
    linear-gradient(135deg, #1A1A1A 0%, #2C1810 50%, #1A1A1A 100%);
  border: 4px solid #654321;
  border-radius: 16px;
  position: relative;
}

.board-title {
  text-align: center;
  margin-bottom: 30px;
}

.board-title h3 {
  font-family: 'Source Code Pro', monospace;
  font-size: 24px;
  color: #FFD700;
  letter-spacing: 3px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.timeline-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.timeline-slot {
  animation: slotAppear 0.6s ease-out var(--slot-delay) both;
}

.slot-content {
  background: 
    linear-gradient(135deg, #E6D3A3 0%, #D4C5A0 100%);
  border: 3px solid #2C1810;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.slot-content:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
}

.time-marker {
  font-family: 'Source Code Pro', monospace;
  font-size: 18px;
  font-weight: bold;
  color: #8B0000;
  margin-bottom: 8px;
}

.event-icon {
  font-size: 32px;
  color: #2C1810;
  margin-bottom: 8px;
}

.event-name {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #2C1810;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Warning inscription */
.warning-inscription {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.inscription-border {
  background: 
    linear-gradient(135deg, #8B0000 0%, #DC143C 100%);
  border: 4px solid #2C1810;
  border-radius: 12px;
  padding: 20px 40px;
  position: relative;
  
  /* Glowing effect */
  box-shadow: 
    0 0 20px rgba(220, 20, 60, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.inscription-text {
  font-family: 'Source Code Pro', monospace;
  font-size: 14px;
  font-weight: bold;
  color: #FFD700;
  text-align: center;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: warningGlow 2s ease-in-out infinite alternate;
}

/* Animations */
@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: translateY(40px) rotateX(-15deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
}

@keyframes slotAppear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes warningGlow {
  0% {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }
  100% {
    text-shadow: 
      2px 2px 4px rgba(0, 0, 0, 0.8),
      0 0 10px rgba(255, 215, 0, 0.6);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .inscryption-game-card {
    width: 240px;
    height: 360px;
  }
  
  .creature-portrait {
    width: 120px;
    height: 120px;
  }
  
  .creature-icon {
    font-size: 48px;
  }
  
  .timeline-board {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }
  
  .inscription-text {
    font-size: 10px;
    letter-spacing: 1px;
  }
}
</style>