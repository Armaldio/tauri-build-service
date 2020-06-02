<template>
  <v-container justify-center align-center>
    <v-row>
      <v-text-field v-model="url" :disabled="isLoading" label="Enter a URL">
        <template #append>
          <v-btn :disabled="isLoading || !url" :loading="isLoading" @click="startDownload">
            Generate
          </v-btn>
        </template>
      </v-text-field>
    </v-row>
    <v-checkbox v-model="scrollToBottom" label="Scroll to bottom" />
    <pre ref="pre" class="log">
{{ lines }}
    </pre>
    <v-list v-if="directories.length > 0">
      <v-list-item
        v-for="directory in directories"
        :key="directory.path"
        @click="download(directory)"
      >
        {{ directory.name }}
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>
import socket from '~/plugins/socket.io.js'

export default {
  data () {
    return {
      url: '',
      isLoading: false,
      directories: [],
      log: [],
      scrollToBottom: true
    }
  },
  computed: {
    lines () {
      return this.log.join('\n')
    }
  },
  mounted () {
    socket.on('log', (line) => {
      this.log.push(line.trim())

      if (this.scrollToBottom) {
        const element = this.$refs.pre
        element.scrollTop = element.scrollHeight
      }
    })

    socket.on('done', (directories) => {
      this.directories = directories
      this.isLoading = false
    })
  },
  methods: {
    download (directory) {
      window.open(`/download?id=${directory.id}&path=${directory.path}`)
    },
    startDownload () {
      try {
        this.isLoading = true
        const url = this.url
        socket.emit('start', url, () => {
          console.log('response')
        })
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .log {
    padding: 35px;
    border: 1px solid #313131;
    overflow: scroll;
    height: 500px;
  }
</style>
