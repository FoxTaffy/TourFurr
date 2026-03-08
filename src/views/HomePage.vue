<template>
  <div id="app">
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <Header />
    <main>
      <Hero />
      <Event />
      <Info />
      <ParticipantsList />
      <Rules />
      <FAQ />
      <Registration />
      <Contacts />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '../components/Header.vue'
import Hero from '../components/Hero.vue'
import Event from '../components/Event.vue'
import Info from '../components/Info.vue'
import ParticipantsList from '../components/ParticipantsList.vue'
import Rules from '../components/Rules.vue'
import FAQ from '../components/FAQ.vue'
import Registration from '../components/Registration.vue'
import Contacts from '../components/Contacts.vue'
import Footer from '../components/Footer.vue'
</script>
