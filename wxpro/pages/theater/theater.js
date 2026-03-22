Page({
  data: {
    isBound: false,
    showAddModal: false,
    statusBarHeight: 0,
    showLockedModal: false,
    lockedEp: null,
    episodes: [
      {
        id: 1, num: '01',
        title: 'Nice to meet you',
        desc: '贝贝鲨想要认识你。',
        status: 'unlocked',
        progress: 0, total: 0
      },
      {
        id: 2, num: '02',
        title: 'Good morning',
        desc: '贝贝鲨赖床不起怎么办？',
        status: 'next',
        progress: 5, total: 10
      },
      {
        id: 3, num: '03',
        title: 'Where is it ?',
        desc: '贝贝鲨找东西',
        status: 'locked',
        progress: 0, total: 0
      },
      {
        id: 4, num: '04',
        title: '歌曲 Click Click Click',
        desc: '一起来拍照吧！',
        status: 'locked',
        progress: 0, total: 0
      },
      {
        id: 5, num: '05',
        title: 'Can you see it ?',
        desc: '野生动物园里有什么？',
        status: 'locked',
        progress: 0, total: 0
      },
      {
        id: 6, num: '06',
        title: "I'm sorry！It's fine",
        desc: '给人添麻烦要勇于承认错误。',
        status: 'locked',
        progress: 0, total: 0
      },
      {
        id: 7, num: '07',
        title: 'My body',
        desc: '我的身体构造。',
        status: 'locked',
        progress: 0, total: 0
      }
    ]
  },

  onLoad() {
    const { statusBarHeight } = wx.getSystemInfoSync()
    this.setData({ statusBarHeight })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    const activeDeviceId = wx.getStorageSync('activeDeviceId') || ''
    this.setData({ isBound: !!activeDeviceId })
  },

  onEpisodeTap(e) {
    const { status, id } = e.currentTarget.dataset
    if (status === 'unlocked') {
      wx.showToast({ title: '播放功能开发中', icon: 'none' })
    } else {
      const ep = this.data.episodes.find(ep => ep.id === id)
      this.setData({ showLockedModal: true, lockedEp: ep })
    }
  },

  closeLockedModal() {
    this.setData({ showLockedModal: false, lockedEp: null })
  },

  onBindDevice() {
    this.setData({ showAddModal: true })
  },

  goToScan() {
    this.setData({ showAddModal: false })
    wx.navigateTo({ url: '/pages/add-device/add-device' })
  }
})
