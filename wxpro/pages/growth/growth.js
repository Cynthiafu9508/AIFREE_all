Page({
  data: {
    isBound: false,
    showAddModal: false,
    activeFeatureId: '',
    features: [
      {
        id: 'english',
        title: '英语启蒙',
        desc: '通过趣味对话和互动游戏，掌握基础单词、短语和简单对话。',
        image: '/images/growth/英语启蒙.jpg',
        bg: '#e8f4fd',
        btnColor: '#18AEFB',
        borderColor: '#18AEFB'
      },
      {
        id: 'math',
        title: '数感培养',
        desc: '培养数学思维和逻辑能力，让数学变得有趣。',
        image: '/images/growth/数感培养.jpg',
        bg: '#fff9e6',
        btnColor: '#f5a623',
        borderColor: '#f5a623'
      },
      {
        id: 'story',
        title: '睡前故事',
        desc: '温馨的睡前故事陪伴，培养阅读兴趣，促进良好睡眠习惯。',
        image: '/images/growth/睡前故事.jpg',
        bg: '#f0ecfd',
        btnColor: '#8b6be8',
        borderColor: '#8b6be8'
      },
      {
        id: 'encyclopedia',
        title: '百科知识',
        desc: '探索自然、科学、历史等丰富知识，满足孩子的好奇心。',
        image: '/images/growth/百科知识.jpg',
        bg: '#edf8ec',
        btnColor: '#4caf50',
        borderColor: '#4caf50'
      },
      {
        id: 'poetry',
        title: '诗词教学',
        desc: '学习经典古诗词，提升语言表达能力和文学素养。',
        image: '/images/growth/竹林念诗.jpg',
        bg: '#fef0e6',
        btnColor: '#ff7a45',
        borderColor: '#ff7a45'
      }
    ]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    const activeDeviceId = wx.getStorageSync('activeDeviceId') || ''
    const activeFeatureId = wx.getStorageSync('activeFeatureId') || ''
    this.setData({ isBound: !!activeDeviceId, activeFeatureId })
  },

  onBindDevice() {
    this.setData({ showAddModal: true })
  },

  goToScan() {
    this.setData({ showAddModal: false })
    wx.navigateTo({ url: '/pages/add-device/add-device' })
  },

  onSelectFeature(e) {
    const { id } = e.currentTarget.dataset
    if (id === this.data.activeFeatureId) return
    wx.setStorageSync('activeFeatureId', id)
    this.setData({ activeFeatureId: id })
    wx.showToast({ title: '已切换模式', icon: 'success' })
  }
})
