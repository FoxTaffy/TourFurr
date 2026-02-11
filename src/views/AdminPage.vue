<template>
  <div class="admin-page">
    <!-- Animated Background -->
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <router-link to="/" class="logo">
          <img :src="logoImg" alt="TourFurr" class="logo-img" />
          <span v-if="!sidebarCollapsed" class="logo-text">TourFurr</span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="tab.icon"></svg>
          <span v-if="!sidebarCollapsed" class="nav-label">{{ tab.label }}</span>
          <span v-if="!sidebarCollapsed && tab.badge" class="nav-badge" :class="tab.badgeClass">{{ tab.badge }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg class="nav-icon" :style="{ transform: sidebarCollapsed ? 'rotate(180deg)' : '' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
          </svg>
          <span v-if="!sidebarCollapsed" class="nav-label">Свернуть</span>
        </button>
        <router-link to="/dashboard" class="nav-item back-link">
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span v-if="!sidebarCollapsed" class="nav-label">В кабинет</span>
        </router-link>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="mobile-header">
      <button class="mobile-menu-btn" @click="mobileMenuOpen = !mobileMenuOpen">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <h2 class="mobile-title">Админ-панель</h2>
      <router-link to="/dashboard" class="mobile-back">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
      </router-link>
    </header>

    <!-- Mobile Overlay -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false"></div>
    <aside v-if="mobileMenuOpen" class="mobile-sidebar">
      <nav class="sidebar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id; mobileMenuOpen = false"
        >
          <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="tab.icon"></svg>
          <span class="nav-label">{{ tab.label }}</span>
          <span v-if="tab.badge" class="nav-badge" :class="tab.badgeClass">{{ tab.badge }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="admin-main" :class="{ shifted: !sidebarCollapsed }">
      <!-- ============================== DASHBOARD TAB ============================== -->
      <div v-if="activeTab === 'dashboard'" class="tab-content">
        <div class="tab-header">
          <h1 class="tab-title">Обзор</h1>
          <p class="tab-subtitle">Статистика и аналитика TourFurr</p>
        </div>

        <!-- Top Stats Row -->
        <div class="stats-row">
          <div class="stat-widget" v-for="s in topStats" :key="s.label">
            <div class="stat-icon-wrap" :style="{ background: s.bg }">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="s.icon" :style="{ color: s.color }"></svg>
            </div>
            <div class="stat-body">
              <span class="stat-number">{{ s.value }}</span>
              <span class="stat-label">{{ s.label }}</span>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-row">
          <!-- Status Distribution Donut -->
          <div class="chart-card">
            <h3 class="chart-title">Статус регистраций</h3>
            <div class="donut-container">
              <svg viewBox="0 0 200 200" class="donut-chart">
                <circle
                  v-for="(seg, i) in donutSegments"
                  :key="i"
                  cx="100" cy="100" r="80"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="28"
                  :stroke-dasharray="seg.dash"
                  :stroke-dashoffset="seg.offset"
                  :style="{ transition: 'all 0.8s ease ' + (i * 0.15) + 's' }"
                />
              </svg>
              <div class="donut-center">
                <span class="donut-total">{{ users.length }}</span>
                <span class="donut-label">всего</span>
              </div>
            </div>
            <div class="donut-legend">
              <div v-for="(seg, i) in donutSegments" :key="i" class="legend-item">
                <span class="legend-dot" :style="{ background: seg.color }"></span>
                <span class="legend-text">{{ seg.label }}</span>
                <span class="legend-value">{{ seg.count }}</span>
              </div>
            </div>
          </div>

          <!-- Houses Distribution Bar Chart -->
          <div class="chart-card">
            <h3 class="chart-title">Великие Дома</h3>
            <div class="bar-chart">
              <div v-for="house in houseStats" :key="house.slug" class="bar-row">
                <div class="bar-info">
                  <img :src="house.crest" :alt="house.name" class="bar-crest" @error="($event.target as HTMLImageElement).style.display='none'" />
                  <span class="bar-name">{{ house.name }}</span>
                </div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    :style="{ width: house.percent + '%', background: house.color, transition: 'width 0.8s ease' }"
                  ></div>
                </div>
                <span class="bar-count">{{ house.count }}</span>
              </div>
            </div>
            <p v-if="houseStats.length === 0" class="empty-chart">Нет данных о домах</p>
          </div>
        </div>

        <!-- Second Charts Row -->
        <div class="charts-row">
          <!-- Payment Status -->
          <div class="chart-card">
            <h3 class="chart-title">Статус оплаты</h3>
            <div class="payment-stats">
              <div v-for="ps in paymentStats" :key="ps.label" class="payment-item">
                <div class="payment-bar-wrap">
                  <div class="payment-bar" :style="{ height: ps.percent + '%', background: ps.color }"></div>
                </div>
                <span class="payment-value">{{ ps.count }}</span>
                <span class="payment-label">{{ ps.label }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="chart-card">
            <h3 class="chart-title">Последние регистрации</h3>
            <div class="activity-list">
              <div v-for="user in recentUsers" :key="user.id" class="activity-item">
                <div class="activity-avatar">
                  <img v-if="user.avatar_url" :src="user.avatar_url" :alt="user.nickname" />
                  <span v-else class="activity-letter">{{ user.nickname?.[0]?.toUpperCase() }}</span>
                </div>
                <div class="activity-info">
                  <span class="activity-name">{{ user.nickname }}</span>
                  <span class="activity-time">{{ formatRelativeDate(user.created_at) }}</span>
                </div>
                <span class="activity-status" :class="user.status">{{ statusLabels[user.status] }}</span>
              </div>
              <p v-if="recentUsers.length === 0" class="empty-chart">Нет регистраций</p>
            </div>
          </div>
        </div>

        <!-- Registration Timeline -->
        <div class="chart-card full-width">
          <h3 class="chart-title">Регистрации по дням</h3>
          <div class="timeline-chart" v-if="timelineData.length > 0">
            <div class="timeline-bars">
              <div
                v-for="(day, i) in timelineData"
                :key="i"
                class="timeline-bar-wrap"
                :title="day.date + ': ' + day.count"
              >
                <div
                  class="timeline-bar"
                  :style="{ height: day.percent + '%', transition: 'height 0.6s ease ' + (i * 0.03) + 's' }"
                ></div>
                <span class="timeline-label">{{ day.shortDate }}</span>
              </div>
            </div>
          </div>
          <p v-else class="empty-chart">Нет данных для отображения</p>
        </div>
      </div>

      <!-- ============================== USERS TAB ============================== -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="tab-header">
          <h1 class="tab-title">Пользователи</h1>
          <p class="tab-subtitle">Управление участниками конвента</p>
        </div>

        <!-- Search and Filters -->
        <div class="toolbar">
          <div class="search-box">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по нику, email, телефону..."
              class="search-input"
            />
          </div>
          <div class="filter-chips">
            <button
              v-for="filter in filters"
              :key="filter.value"
              @click="activeFilter = filter.value"
              class="chip"
              :class="{ active: activeFilter === filter.value }"
            >
              {{ filter.label }}
              <span class="chip-count">{{ getFilterCount(filter.value) }}</span>
            </button>
          </div>
        </div>

        <!-- Users Table / Cards -->
        <div v-if="isLoading" class="loading-state">
          <div class="page-spinner"></div>
          <p>Загрузка пользователей...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="empty-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p>Нет пользователей для отображения</p>
        </div>

        <div v-else class="users-grid">
          <div v-for="user in filteredUsers" :key="user.id" class="user-card">
            <div class="user-card-top">
              <div class="user-avatar-wrap">
                <img v-if="user.avatar_url" :src="user.avatar_url" alt="Avatar" class="user-avatar" />
                <span v-else class="avatar-letter">{{ user.nickname?.[0]?.toUpperCase() }}</span>
              </div>
              <div class="user-meta">
                <h3 class="user-nickname"><TeamBadge :teamId="user.team_id" />{{ user.nickname }}</h3>
                <p class="user-email">{{ user.email }}</p>
                <span class="user-date-sm">{{ formatRelativeDate(user.created_at) }}</span>
              </div>
              <div class="user-status-badge" :class="user.status">
                {{ statusLabels[user.status] }}
              </div>
            </div>

            <!-- Contact Details -->
            <div class="user-contacts">
              <div v-if="user.phone" class="contact-chip">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                <span>{{ user.phone }}</span>
              </div>
              <div v-if="user.telegram" class="contact-chip telegram">
                <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/></svg>
                <a :href="'https://' + user.telegram" target="_blank">{{ user.telegram }}</a>
              </div>
            </div>

            <!-- Description -->
            <p v-if="user.description" class="user-desc">{{ user.description }}</p>

            <!-- Actions -->
            <div class="user-actions">
              <button
                v-if="user.status !== 'approved' && user.status !== 'paid'"
                @click="updateStatus(user.id, 'approved')"
                class="action-btn approve"
                :disabled="isUpdating === user.id"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Одобрить
              </button>
              <button
                v-if="user.status === 'approved'"
                @click="updateStatus(user.id, 'paid')"
                class="action-btn paid"
                :disabled="isUpdating === user.id"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                Оплачено
              </button>
              <button
                v-if="user.status === 'pending'"
                @click="updateStatus(user.id, 'deferred')"
                class="action-btn defer"
                :disabled="isUpdating === user.id"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Отложить
              </button>
              <button
                v-if="user.status !== 'rejected'"
                @click="updateStatus(user.id, 'rejected')"
                class="action-btn reject"
                :disabled="isUpdating === user.id"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                Отклонить
              </button>
              <button
                v-if="user.status !== 'pending' && user.status !== 'deferred'"
                @click="updateStatus(user.id, 'pending')"
                class="action-btn reset"
                :disabled="isUpdating === user.id"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                На рассмотрение
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================== HOUSES TAB ============================== -->
      <div v-if="activeTab === 'houses'" class="tab-content">
        <div class="tab-header">
          <h1 class="tab-title">Великие Дома</h1>
          <p class="tab-subtitle">Назначение домов участникам (Кеса, Ал, Диеро)</p>
        </div>

        <!-- House Assignment -->
        <div class="houses-grid">
          <div v-for="team in teamsStore.teams" :key="team.id" class="house-section">
            <div class="house-header">
              <img :src="team.crest_url || `/images/crests/${team.slug}.png`" :alt="team.name" class="house-crest-img" @error="($event.target as HTMLImageElement).style.display='none'" />
              <div>
                <h3 class="house-name" :style="{ color: team.color }">{{ team.name }}</h3>
                <span class="house-count">{{ getHouseMembers(team.id).length }} участников</span>
              </div>
            </div>

            <!-- Members in this house -->
            <div class="house-members">
              <div v-for="member in getHouseMembers(team.id)" :key="member.id" class="house-member">
                <div class="member-info">
                  <div class="member-avatar-sm">
                    <img v-if="member.avatar_url" :src="member.avatar_url" alt="" />
                    <span v-else>{{ member.nickname?.[0]?.toUpperCase() }}</span>
                  </div>
                  <span class="member-name">{{ member.nickname }}</span>
                </div>
                <button class="remove-house-btn" @click="assignHouse(member.id, null)" :disabled="isUpdating === member.id">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <p v-if="getHouseMembers(team.id).length === 0" class="no-members">Нет участников</p>
            </div>

            <!-- Add user to this house -->
            <div class="add-to-house">
              <select class="house-select" @change="onHouseAssign($event, team.id)">
                <option value="">+ Добавить участника...</option>
                <option v-for="u in unassignedUsers" :key="u.id" :value="u.id">{{ u.nickname }} ({{ u.email }})</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Unassigned Users -->
        <div class="unassigned-section" v-if="unassignedUsers.length > 0">
          <h3 class="section-title">Без дома ({{ unassignedUsers.length }})</h3>
          <div class="unassigned-list">
            <div v-for="u in unassignedUsers" :key="u.id" class="unassigned-user">
              <div class="member-avatar-sm">
                <img v-if="u.avatar_url" :src="u.avatar_url" alt="" />
                <span v-else>{{ u.nickname?.[0]?.toUpperCase() }}</span>
              </div>
              <span class="member-name">{{ u.nickname }}</span>
              <span class="user-status-badge" :class="u.status">{{ statusLabels[u.status] }}</span>
              <select class="house-select-sm" @change="onHouseAssign($event, ($event.target as HTMLSelectElement).value, u.id)">
                <option value="">Назначить дом...</option>
                <option v-for="team in teamsStore.teams" :key="team.id" :value="team.id">{{ team.name }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================== APPLICATIONS TAB ============================== -->
      <div v-if="activeTab === 'applications'" class="tab-content">
        <div class="tab-header">
          <h1 class="tab-title">Управление заявками</h1>
          <p class="tab-subtitle">Рассмотрение заявок на участие</p>
        </div>

        <div class="filter-chips" style="margin-bottom: 1.5rem;">
          <button @click="appFilter = 'pending'" class="chip" :class="{ active: appFilter === 'pending' }">
            На рассмотрении <span class="chip-count">{{ pendingCount }}</span>
          </button>
          <button @click="appFilter = 'deferred'" class="chip" :class="{ active: appFilter === 'deferred' }">
            Отложенные <span class="chip-count">{{ deferredCount }}</span>
          </button>
          <button @click="appFilter = 'all'" class="chip" :class="{ active: appFilter === 'all' }">
            Все <span class="chip-count">{{ users.length }}</span>
          </button>
        </div>

        <div v-if="isLoading" class="loading-state">
          <div class="page-spinner"></div>
          <p>Загрузка заявок...</p>
        </div>

        <div v-else class="applications-list">
          <div v-for="user in applicationUsers" :key="user.id" class="application-card">
            <div class="app-card-header">
              <div class="app-user-info">
                <div class="user-avatar-wrap">
                  <img v-if="user.avatar_url" :src="user.avatar_url" alt="" class="user-avatar" />
                  <span v-else class="avatar-letter">{{ user.nickname?.[0]?.toUpperCase() }}</span>
                </div>
                <div>
                  <h3 class="user-nickname">{{ user.nickname }}</h3>
                  <p class="user-email">{{ user.email }}</p>
                </div>
              </div>
              <div class="user-status-badge" :class="user.status">{{ statusLabels[user.status] }}</div>
            </div>

            <div class="app-details">
              <div v-if="user.phone" class="app-detail">
                <span class="app-label">Телефон:</span> {{ user.phone }}
              </div>
              <div v-if="user.telegram" class="app-detail">
                <span class="app-label">Telegram:</span>
                <a :href="'https://' + user.telegram" target="_blank">{{ user.telegram }}</a>
              </div>
              <div v-if="user.description" class="app-detail">
                <span class="app-label">О себе:</span> {{ user.description }}
              </div>
              <div class="app-detail">
                <span class="app-label">Дата:</span> {{ formatRelativeDate(user.created_at) }}
              </div>
            </div>

            <div class="user-actions">
              <button
                v-if="user.status !== 'approved' && user.status !== 'paid'"
                @click="updateStatus(user.id, 'approved')"
                class="action-btn approve"
                :disabled="isUpdating === user.id"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Одобрить
              </button>
              <button
                v-if="user.status === 'pending'"
                @click="updateStatus(user.id, 'deferred')"
                class="action-btn defer"
                :disabled="isUpdating === user.id"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Отложить
              </button>
              <button
                v-if="user.status !== 'rejected'"
                @click="updateStatus(user.id, 'rejected')"
                class="action-btn reject"
                :disabled="isUpdating === user.id"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                Отклонить
              </button>
            </div>
          </div>

          <div v-if="applicationUsers.length === 0" class="empty-state">
            <p>Нет заявок для отображения</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
import TeamBadge from '../components/TeamBadge.vue'
import logoImg from '../assets/logo.png'

const router = useRouter()
const authStore = useAuthStore()
const teamsStore = useTeamsStore()

const activeTab = ref('dashboard')
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)
const searchQuery = ref('')

interface User {
  id: string
  email: string
  nickname: string
  phone: string
  telegram: string
  avatar_url: string | null
  description: string | null
  status: string
  created_at: string
  team_id: string | null
}

const users = ref<User[]>([])
const isLoading = ref(true)
const isUpdating = ref<string | null>(null)
const activeFilter = ref('all')

const tabs = computed(() => [
  {
    id: 'dashboard',
    label: 'Дашборд',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>',
    badge: null,
    badgeClass: ''
  },
  {
    id: 'applications',
    label: 'Заявки',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
    badge: pendingCount.value > 0 ? pendingCount.value : null,
    badgeClass: 'badge-warn'
  },
  {
    id: 'users',
    label: 'Пользователи',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>',
    badge: null,
    badgeClass: ''
  },
  {
    id: 'houses',
    label: 'Великие Дома',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>',
    badge: null,
    badgeClass: ''
  }
])

const filters = [
  { label: 'Все', value: 'all' },
  { label: 'На рассмотрении', value: 'pending' },
  { label: 'Отложенные', value: 'deferred' },
  { label: 'Одобрено', value: 'approved' },
  { label: 'Оплачено', value: 'paid' },
  { label: 'Отклонено', value: 'rejected' }
]

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  deferred: 'Отложено',
  approved: 'Одобрено',
  paid: 'Оплачено',
  rejected: 'Отклонено'
}

const appFilter = ref('pending')

// ---- Computed Stats ----
const pendingCount = computed(() => users.value.filter(u => u.status === 'pending').length)
const deferredCount = computed(() => users.value.filter(u => u.status === 'deferred').length)
const approvedCount = computed(() => users.value.filter(u => u.status === 'approved').length)
const paidCount = computed(() => users.value.filter(u => u.status === 'paid').length)
const rejectedCount = computed(() => users.value.filter(u => u.status === 'rejected').length)

// ---- Application Users ----
const applicationUsers = computed(() => {
  if (appFilter.value === 'all') return users.value
  return users.value.filter(u => u.status === appFilter.value)
})

// ---- House Assignment ----
function getHouseMembers(teamId: string) {
  return users.value.filter(u => {
    if (u.team_id === teamId) return true
    try {
      return localStorage.getItem(`user_team_${u.id}`) === teamId
    } catch { return false }
  })
}

const unassignedUsers = computed(() => {
  return users.value.filter(u => {
    if (u.team_id) return false
    try {
      const local = localStorage.getItem(`user_team_${u.id}`)
      return !local
    } catch { return true }
  }).filter(u => u.status === 'approved' || u.status === 'paid')
})

async function assignHouse(userId: string, teamId: string | null) {
  isUpdating.value = userId
  try {
    // Try DB update
    try {
      await supabase.from('users').update({ team_id: teamId }).eq('id', userId)
    } catch { /* column may not exist */ }

    // Always update localStorage
    if (teamId) {
      localStorage.setItem(`user_team_${userId}`, teamId)
    } else {
      localStorage.removeItem(`user_team_${userId}`)
    }

    // Update local state
    const user = users.value.find(u => u.id === userId)
    if (user) {
      user.team_id = teamId
    }
  } catch (err) {
    console.error('Error assigning house:', err)
  } finally {
    isUpdating.value = null
  }
}

function onHouseAssign(event: Event, teamIdOrSelectValue: string, userId?: string) {
  const select = event.target as HTMLSelectElement
  const selectedUserId = userId || select.value
  const teamId = userId ? teamIdOrSelectValue : teamIdOrSelectValue

  if (!selectedUserId || !teamId) return

  assignHouse(userId || selectedUserId, teamId)
  select.value = ''
}

const topStats = computed(() => [
  {
    label: 'Всего',
    value: users.value.length,
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.15)'
  },
  {
    label: 'На рассмотрении',
    value: pendingCount.value,
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    color: '#ffb347',
    bg: 'rgba(255, 179, 71, 0.15)'
  },
  {
    label: 'Одобрено',
    value: approvedCount.value,
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)'
  },
  {
    label: 'Оплачено',
    value: paidCount.value,
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)'
  },
  {
    label: 'Отклонено',
    value: rejectedCount.value,
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)'
  }
])

// ---- Donut Chart ----
const CIRCUMFERENCE = 2 * Math.PI * 80 // ~502.65

const donutSegments = computed(() => {
  const total = users.value.length || 1
  const segments = [
    { label: 'На рассмотрении', count: pendingCount.value, color: '#ffb347' },
    { label: 'Отложено', count: deferredCount.value, color: '#fbbf24' },
    { label: 'Одобрено', count: approvedCount.value, color: '#22c55e' },
    { label: 'Оплачено', count: paidCount.value, color: '#10b981' },
    { label: 'Отклонено', count: rejectedCount.value, color: '#ef4444' }
  ]

  let cumulative = 0
  return segments.map(s => {
    const fraction = s.count / total
    const dashLen = fraction * CIRCUMFERENCE
    const gap = CIRCUMFERENCE - dashLen
    const offset = -cumulative * CIRCUMFERENCE + CIRCUMFERENCE * 0.25
    cumulative += fraction
    return {
      ...s,
      dash: `${dashLen} ${gap}`,
      offset
    }
  })
})

// ---- House Stats ----
const houseStats = computed(() => {
  const teams = teamsStore.teams
  if (!teams.length) return []

  const houseCounts: Record<string, number> = {}
  for (const u of users.value) {
    if (u.team_id) {
      houseCounts[u.team_id] = (houseCounts[u.team_id] || 0) + 1
    }
  }

  // Also check localStorage fallback
  for (const u of users.value) {
    if (!u.team_id) {
      try {
        const localTeam = localStorage.getItem(`user_team_${u.id}`)
        if (localTeam) {
          houseCounts[localTeam] = (houseCounts[localTeam] || 0) + 1
        }
      } catch { /* ignore */ }
    }
  }

  const maxCount = Math.max(1, ...Object.values(houseCounts))

  return teams.map(t => ({
    name: t.name,
    slug: t.slug,
    crest: t.crest_url || `/images/crests/${t.slug}.png`,
    color: t.color,
    count: houseCounts[t.id] || houseCounts[t.slug] || 0,
    percent: ((houseCounts[t.id] || houseCounts[t.slug] || 0) / maxCount) * 100
  }))
})

// ---- Payment Stats ----
const paymentStats = computed(() => {
  const paid = paidCount.value
  const awaitingPayment = approvedCount.value
  const unpaid = pendingCount.value + deferredCount.value
  const total = Math.max(1, paid + awaitingPayment + unpaid)

  return [
    { label: 'Оплачено', count: paid, color: '#10b981', percent: (paid / total) * 100 },
    { label: 'Ожидают оплаты', count: awaitingPayment, color: '#22c55e', percent: (awaitingPayment / total) * 100 },
    { label: 'На рассмотрении', count: unpaid, color: '#ffb347', percent: (unpaid / total) * 100 }
  ]
})

// ---- Timeline ----
const timelineData = computed(() => {
  if (!users.value.length) return []

  const dateCounts: Record<string, number> = {}
  for (const u of users.value) {
    if (!u.created_at) continue
    const date = new Date(u.created_at).toISOString().split('T')[0]
    dateCounts[date] = (dateCounts[date] || 0) + 1
  }

  const sorted = Object.entries(dateCounts).sort((a, b) => a[0].localeCompare(b[0]))
  const maxVal = Math.max(1, ...sorted.map(([, v]) => v))

  // Show last 21 days max
  const recent = sorted.slice(-21)
  return recent.map(([date, count]) => ({
    date,
    shortDate: new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    count,
    percent: (count / maxVal) * 100
  }))
})

// ---- Recent Users ----
const recentUsers = computed(() => {
  return [...users.value]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
})

// ---- Filtered Users ----
const filteredUsers = computed(() => {
  let list = users.value
  if (activeFilter.value !== 'all') {
    list = list.filter(u => u.status === activeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(u =>
      u.nickname?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q) ||
      u.telegram?.toLowerCase().includes(q)
    )
  }
  return list
})

function getFilterCount(value: string) {
  if (value === 'all') return users.value.length
  return users.value.filter(u => u.status === value).length
}

// ---- Actions ----
async function loadUsers() {
  isLoading.value = true
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && data) {
    users.value = data
  }
  isLoading.value = false
}

async function updateStatus(userId: string, status: string) {
  isUpdating.value = userId
  try {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)

    if (error) {
      console.error('Error updating status:', error)
      alert('Ошибка обновления статуса')
      return
    }

    const user = users.value.find(u => u.id === userId)
    if (user) {
      user.status = status

      if (status === 'approved' || status === 'rejected') {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const token = session?.access_token
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-approval-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ email: user.email, nickname: user.nickname, status })
          })
        } catch (emailError) {
          console.error('Error sending approval email:', emailError)
        }
      }
    }
  } catch (err) {
    console.error('Error in updateStatus:', err)
    alert('Произошла ошибка')
  } finally {
    isUpdating.value = null
  }
}

function formatRelativeDate(dateStr: string) {
  if (!dateStr) return ''
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин назад`
  if (hours < 24) return `${hours} ч назад`
  if (days < 7) return `${days} д назад`
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

async function checkAdminAndLoad() {
  if (!authStore.user?.isAdmin) {
    alert('У вас нет прав доступа к админ-панели')
    router.push('/dashboard')
    return
  }
  await Promise.all([
    loadUsers(),
    teamsStore.fetchTeams()
  ])
}

onMounted(() => {
  checkAdminAndLoad()
})
</script>

<style scoped>
/* ============================================================================
   LAYOUT
   ============================================================================ */
.admin-page {
  min-height: 100vh;
  display: flex;
  position: relative;
}

/* ============================================================================
   SIDEBAR
   ============================================================================ */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  z-index: 100;
  background: rgba(18, 12, 10, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(139, 111, 71, 0.25);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 68px;
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(139, 111, 71, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}

.logo-text {
  font-family: 'Merriweather', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--fire-glow);
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-footer {
  padding: 0.75rem 0;
  border-top: 1px solid rgba(139, 111, 71, 0.2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: none;
  border: none;
  color: var(--sage);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
  position: relative;
}

.nav-item:hover {
  color: var(--cream);
  background: rgba(255, 179, 71, 0.08);
}

.nav-item.active {
  color: var(--fire-glow);
  background: rgba(255, 179, 71, 0.12);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  background: var(--fire-glow);
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.nav-label {
  overflow: hidden;
}

.nav-badge {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 22px;
  text-align: center;
}

.nav-badge.badge-warn {
  background: rgba(255, 179, 71, 0.25);
  color: var(--fire-glow);
}

.back-link {
  color: var(--sage);
}

/* ============================================================================
   MOBILE HEADER
   ============================================================================ */
.mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  z-index: 100;
  background: rgba(18, 12, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139, 111, 71, 0.25);
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
}

.mobile-menu-btn, .mobile-back {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--fire-glow);
  cursor: pointer;
  text-decoration: none;
}

.mobile-menu-btn svg, .mobile-back svg {
  width: 24px;
  height: 24px;
}

.mobile-title {
  font-family: 'Merriweather', serif;
  font-size: 1.1rem;
  color: var(--fire-glow);
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 150;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100vh;
  z-index: 200;
  background: rgba(18, 12, 10, 0.98);
  border-right: 1px solid rgba(139, 111, 71, 0.3);
  padding-top: 1rem;
}

/* ============================================================================
   MAIN CONTENT
   ============================================================================ */
.admin-main {
  flex: 1;
  margin-left: 68px;
  padding: 2rem;
  position: relative;
  z-index: 10;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.admin-main.shifted {
  margin-left: 240px;
}

.tab-content {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeUp 0.4s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-header {
  margin-bottom: 2rem;
}

.tab-title {
  font-family: 'Merriweather', serif;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: var(--fire-glow);
  margin-bottom: 0.25rem;
}

.tab-subtitle {
  color: var(--sage);
  font-size: 0.95rem;
}

/* ============================================================================
   DASHBOARD: STATS ROW
   ============================================================================ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-widget {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(26, 17, 14, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 111, 71, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-widget:hover {
  transform: translateY(-3px);
  border-color: rgba(139, 111, 71, 0.4);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-wrap svg {
  width: 24px;
  height: 24px;
}

.stat-body {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-family: 'Merriweather', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cream);
  line-height: 1.1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--sage);
  margin-top: 2px;
}

/* ============================================================================
   DASHBOARD: CHART CARDS
   ============================================================================ */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background: rgba(26, 17, 14, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 111, 71, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-title {
  font-family: 'Merriweather', serif;
  font-size: 1.1rem;
  color: var(--fire-glow);
  margin-bottom: 1.25rem;
}

.empty-chart {
  text-align: center;
  color: var(--sage);
  font-style: italic;
  padding: 2rem 0;
}

/* ---- Donut Chart ---- */
.donut-container {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 1rem;
}

.donut-chart {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-total {
  font-family: 'Merriweather', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--cream);
  line-height: 1;
}

.donut-label {
  font-size: 0.75rem;
  color: var(--sage);
  margin-top: 2px;
}

.donut-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-text {
  color: var(--sage);
}

.legend-value {
  font-weight: 700;
  color: var(--cream);
}

/* ---- Bar Chart (Houses) ---- */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 120px;
  flex-shrink: 0;
}

.bar-crest {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.bar-name {
  font-size: 0.85rem;
  color: var(--cream);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bar-track {
  flex: 1;
  height: 24px;
  background: rgba(42, 31, 26, 0.6);
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
  min-width: 4px;
}

.bar-count {
  width: 32px;
  text-align: right;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--cream);
}

/* ---- Payment Stats (Vertical Bars) ---- */
.payment-stats {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  padding-top: 1rem;
}

.payment-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.payment-bar-wrap {
  width: 48px;
  height: 140px;
  background: rgba(42, 31, 26, 0.6);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.payment-bar {
  width: 100%;
  border-radius: 8px;
  min-height: 4px;
  transition: height 0.8s ease;
}

.payment-value {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--cream);
}

.payment-label {
  font-size: 0.8rem;
  color: var(--sage);
  text-align: center;
}

/* ---- Activity List ---- */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.activity-item:hover {
  background: rgba(42, 31, 26, 0.5);
}

.activity-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--forest-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-letter {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--fire-glow);
}

.activity-info {
  flex: 1;
  min-width: 0;
}

.activity-name {
  display: block;
  font-size: 0.9rem;
  color: var(--cream);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--sage);
}

.activity-status {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.activity-status.pending {
  background: rgba(255, 179, 71, 0.2);
  color: var(--fire-glow);
}

.activity-status.deferred {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.activity-status.approved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.activity-status.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* ---- Timeline Chart ---- */
.timeline-chart {
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.timeline-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 160px;
  min-width: max-content;
}

.timeline-bar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 40px;
  height: 100%;
  justify-content: flex-end;
}

.timeline-bar {
  width: 28px;
  background: linear-gradient(180deg, var(--fire-glow), var(--fire));
  border-radius: 6px 6px 2px 2px;
  min-height: 4px;
}

.timeline-label {
  font-size: 0.65rem;
  color: var(--sage);
  white-space: nowrap;
}

/* ============================================================================
   USERS TAB
   ============================================================================ */
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  max-width: 420px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--sage);
}

.search-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  background: rgba(26, 17, 14, 0.7);
  border: 1px solid rgba(139, 111, 71, 0.3);
  border-radius: 12px;
  color: var(--cream);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input::placeholder {
  color: var(--sage);
  opacity: 0.6;
}

.search-input:focus {
  outline: none;
  border-color: var(--fire-glow);
  box-shadow: 0 0 0 3px rgba(255, 179, 71, 0.1);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid rgba(139, 111, 71, 0.25);
  border-radius: 20px;
  color: var(--sage);
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.chip:hover {
  border-color: rgba(139, 111, 71, 0.5);
  color: var(--cream);
}

.chip.active {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 179, 71, 0.15));
  border-color: var(--fire-glow);
  color: var(--fire-glow);
}

.chip-count {
  font-weight: 700;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1px 7px;
  border-radius: 8px;
}

.chip.active .chip-count {
  background: rgba(255, 179, 71, 0.2);
}

/* Loading & Empty */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--sage);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  opacity: 0.4;
}

/* ---- User Cards Grid ---- */
.users-grid {
  display: grid;
  gap: 1rem;
}

.user-card {
  background: rgba(26, 17, 14, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 111, 71, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.user-card:hover {
  border-color: rgba(139, 111, 71, 0.4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.user-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.75rem;
}

.user-avatar-wrap {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--forest-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter {
  font-family: 'Merriweather', serif;
  font-size: 1.3rem;
  color: var(--fire-glow);
}

.user-meta {
  flex: 1;
  min-width: 0;
}

.user-nickname {
  font-family: 'Merriweather', serif;
  font-size: 1.1rem;
  color: var(--cream);
  margin-bottom: 2px;
  display: flex;
  align-items: center;
}

.user-email {
  font-size: 0.8rem;
  color: var(--sage);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-date-sm {
  font-size: 0.7rem;
  color: var(--sage);
  opacity: 0.7;
}

.user-status-badge {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

.user-status-badge.pending {
  background: rgba(255, 179, 71, 0.15);
  color: var(--fire-glow);
}

.user-status-badge.deferred {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.user-status-badge.approved {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.user-status-badge.paid {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.user-status-badge.rejected {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* Contacts */
.user-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.contact-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(42, 31, 26, 0.5);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--cream);
}

.contact-chip svg {
  width: 14px;
  height: 14px;
  color: var(--fire);
  flex-shrink: 0;
}

.contact-chip.telegram svg {
  color: #0088cc;
}

.contact-chip a {
  color: var(--fire-glow);
  text-decoration: none;
}

.contact-chip a:hover {
  text-decoration: underline;
}

.user-desc {
  font-size: 0.85rem;
  color: var(--sage);
  line-height: 1.5;
  padding: 8px 10px;
  background: rgba(42, 31, 26, 0.3);
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

/* Actions */
.user-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  background: transparent;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.approve {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}

.action-btn.approve:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.15);
}

.action-btn.defer {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}

.action-btn.defer:hover:not(:disabled) {
  background: rgba(251, 191, 36, 0.15);
}

.action-btn.reject {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.action-btn.reject:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
}

.action-btn.reset {
  color: var(--fire-glow);
  border-color: rgba(255, 179, 71, 0.3);
}

.action-btn.reset:hover:not(:disabled) {
  background: rgba(255, 179, 71, 0.15);
}

.action-btn.paid {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.action-btn.paid:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.15);
}

/* ============================================================================
   HOUSES TAB
   ============================================================================ */
.houses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.house-section {
  background: rgba(26, 17, 14, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 111, 71, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
}

.house-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(139, 111, 71, 0.2);
}

.house-crest-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.house-name {
  font-family: 'Merriweather', serif;
  font-size: 1.1rem;
  font-weight: 700;
}

.house-count {
  font-size: 0.8rem;
  color: var(--sage);
}

.house-members {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  max-height: 240px;
  overflow-y: auto;
}

.house-member {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.house-member:hover {
  background: rgba(42, 31, 26, 0.5);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--forest-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.member-avatar-sm img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-avatar-sm span {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--fire-glow);
}

.member-name {
  font-size: 0.9rem;
  color: var(--cream);
}

.remove-house-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0;
}

.house-member:hover .remove-house-btn {
  opacity: 1;
}

.remove-house-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.remove-house-btn svg {
  width: 14px;
  height: 14px;
}

.no-members {
  text-align: center;
  color: var(--sage);
  font-style: italic;
  font-size: 0.85rem;
  padding: 1rem 0;
}

.add-to-house {
  margin-top: 0.5rem;
}

.house-select,
.house-select-sm {
  width: 100%;
  padding: 8px 12px;
  background: rgba(26, 17, 14, 0.7);
  border: 1px solid rgba(139, 111, 71, 0.3);
  border-radius: 10px;
  color: var(--cream);
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.house-select:focus,
.house-select-sm:focus {
  outline: none;
  border-color: var(--fire-glow);
}

.house-select option,
.house-select-sm option {
  background: var(--forest-deep);
  color: var(--cream);
}

.house-select-sm {
  width: auto;
  min-width: 140px;
  padding: 6px 10px;
  font-size: 0.8rem;
}

.unassigned-section {
  background: rgba(26, 17, 14, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 111, 71, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
}

.section-title {
  font-family: 'Merriweather', serif;
  font-size: 1.1rem;
  color: var(--fire-glow);
  margin-bottom: 1rem;
}

.unassigned-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.unassigned-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.unassigned-user:hover {
  background: rgba(42, 31, 26, 0.4);
}

/* ============================================================================
   APPLICATIONS TAB
   ============================================================================ */
.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.application-card {
  background: rgba(26, 17, 14, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 111, 71, 0.2);
  border-radius: 16px;
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.application-card:hover {
  border-color: rgba(139, 111, 71, 0.4);
}

.app-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.app-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(42, 31, 26, 0.3);
  border-radius: 10px;
}

.app-detail {
  font-size: 0.85rem;
  color: var(--sage);
}

.app-detail a {
  color: var(--fire-glow);
  text-decoration: none;
}

.app-detail a:hover {
  text-decoration: underline;
}

.app-label {
  font-weight: 600;
  color: var(--cream);
}

/* Activity status colors - paid */
.activity-status.paid {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

/* ============================================================================
   RESPONSIVE
   ============================================================================ */
@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }

  .houses-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .mobile-header {
    display: flex;
  }

  .admin-main {
    margin-left: 0 !important;
    padding: 1rem;
    padding-top: calc(56px + 1rem);
  }

  .stats-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .stat-widget {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.4rem;
  }

  .user-card-top {
    flex-wrap: wrap;
  }

  .user-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }

  .bar-info {
    width: 90px;
  }

  .bar-name {
    font-size: 0.75rem;
  }

  .payment-bar-wrap {
    width: 36px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .filter-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }

  .chip {
    white-space: nowrap;
    flex-shrink: 0;
  }
}
</style>
