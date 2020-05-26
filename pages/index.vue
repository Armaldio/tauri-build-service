<template>
  <v-container
    justify-center
    align-center
  >
    <v-row>
      <v-text-field v-model="url" label="Enter a URL" />
    </v-row>
    <v-row>
      <v-btn v-if="!downloadURL" :loading="isLoading" @click="startDownload">
        Generate
      </v-btn>
      <v-btn v-if="downloadURL" download :href="downloadURL">
        Download your app
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
      isLoading: false,
      downloadURL: ''
    }
  },
  methods: {
    async startDownload () {
      try {
        this.isLoading = true
        const url = this.url
        const parsed = await ky.post('/api', {
          json: { url },
          timeout: false, // 1h,
          retry: 0
        }).json()
        this.isLoading = false
        this.downloadURL = `/api/download?id=${parsed.id}`

        console.log('parsed', parsed)
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
