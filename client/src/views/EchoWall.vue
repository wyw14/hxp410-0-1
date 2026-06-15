<template>
  <div class="echo-wall-container">
    <div class="wall-header">
      <span class="wall-icon">🌊</span>
      <h1 class="wall-title">匿名回声墙</h1>
      <p class="wall-subtitle">每一个被宽恕的秘密，都在这里温柔回响</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载秘密...</p>
    </div>

    <div v-else-if="!hasSecrets" class="empty-state">
      <span class="empty-icon">🌸</span>
      <p>{{ message }}</p>
      <button class="btn btn-primary" @click="goToConfess">
        分享第一个秘密
      </button>
    </div>

    <div v-else class="secrets-list">
      <transition-group name="list" tag="div">
        <div
          v-for="(secret, index) in secrets"
          :key="secret.id"
          class="card echo-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="card-decoration">
            <span class="deco-icon">💜</span>
          </div>
          <div class="card-time">
            <span class="time-icon">🕐</span>
            <span class="time-text">{{ formatTime(secret.createdAt) }}</span>
          </div>
          <p class="secret-text">"{{ secret.content }}"</p>
          <div class="card-footer">
            <span class="status-badge">{{ secret.status }}</span>
          </div>
        </div>
      </transition-group>
    </div>

    <div v-if="hasSecrets && totalPages > 1" class="pagination">
      <button
        class="page-btn"
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1 || loading"
      >
        ← 上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} / {{ totalPages }} 页
      </span>
      <button
        class="page-btn"
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages || loading"
      >
        下一页 →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const hasSecrets = ref(false)
const secrets = ref([])
const message = ref('')
const currentPage = ref(1)
const totalPages = ref(0)
const pageSize = 5

async function fetchSecrets(page = 1) {
  loading.value = true
  try {
    const response = await fetch(`/api/secrets/list?page=${page}&pageSize=${pageSize}`)
    const data = await response.json()

    if (data.success) {
      secrets.value = data.data
      hasSecrets.value = data.data.length > 0
      currentPage.value = data.pagination.page
      totalPages.value = data.pagination.totalPages
      if (!hasSecrets.value) {
        message.value = '还没有被宽恕的秘密，成为第一个分享的人吧'
      }
    } else {
      hasSecrets.value = false
      message.value = '获取秘密列表失败'
    }
  } catch (error) {
    console.error('获取秘密列表失败:', error)
    hasSecrets.value = false
    message.value = '暂时无法连接到服务器'
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page < 1 || page > totalPages.value || loading.value) return
  fetchSecrets(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function goToConfess() {
  router.push('/confess')
}

onMounted(() => {
  fetchSecrets(1)
})
</script>

<style scoped>
.echo-wall-container {
  width: 100%;
  max-width: 700px;
}

.wall-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeInDown 0.8s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wall-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 15px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.wall-title {
  color: white;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 10px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.wall-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.loading-state p,
.empty-state p {
  color: #666;
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 30px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.secrets-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.echo-card {
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-decoration {
  position: absolute;
  top: -20px;
  right: -10px;
  font-size: 100px;
  opacity: 0.05;
  pointer-events: none;
}

.deco-icon {
  display: block;
}

.card-time {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #888;
  font-size: 14px;
}

.time-icon {
  font-size: 16px;
}

.secret-text {
  font-size: 18px;
  line-height: 1.8;
  color: #333;
  font-style: italic;
  margin-bottom: 25px;
  word-break: break-word;
}

.card-footer {
  display: flex;
  justify-content: flex-start;
}

.status-badge {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #2d5a4a;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
}

.page-btn {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 500;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
