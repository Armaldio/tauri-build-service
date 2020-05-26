<template>
  <v-container
    justify-center
    align-center
  >
    <v-row>
      <v-text-field label="Enter a URL" />
      <v-btn :loading="isLoading" @click="startDownload">
        Download
      </v-btn>
      <div v-if="isLoading">
        Hold on! It might take a while
      </div>
    </v-row>
  </v-container>
</template>

<script>
import ky from 'ky/umd'

export default {
  data () {
    return {
      url: '',
      isLoading: false
    }
  },
  methods: {
    async startDownload () {
      try {
        this.isLoading = true
        const url = this.url
        const parsed = await ky.post('/api', {
          json: { url },
          timeout: 3600000 // 1h
        }).json()
        this.isLoading = false

        console.log('parsed', parsed)
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
