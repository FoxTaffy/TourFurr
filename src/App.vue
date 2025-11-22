<template>
  <div id="app">
    <div class="bg-forest"></div>
    <div class="fog"></div>
    
    <Header />
    <main>
      <Hero />
      <Event />
      <Info />
      <Rules />
      <FAQ />
      <Registration />
      <Contacts />
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Hero from './components/Hero.vue'
import Event from './components/Event.vue'
import Info from './components/Info.vue'
import Rules from './components/Rules.vue'
import FAQ from './components/FAQ.vue'
import Registration from './components/Registration.vue'
import Contacts from './components/Contacts.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Header,
    Hero,
    Event,
    Info,
    Rules,
    FAQ,
    Registration,
    Contacts,
    Footer
  }
}
</script>