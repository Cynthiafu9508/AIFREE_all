Component({
  data: {
    selected: 0,
    tabs: [
      {
        text: '伙伴',
        pagePath: '/pages/home/home',
        icon: '/images/伙伴logo-gray.png',
        activeIcon: '/images/伙伴logo.png'
      },
      {
        text: '剧场',
        pagePath: '/pages/theater/theater',
        icon: '/images/剧场logo-gray.png',
        activeIcon: '/images/剧场logo.png'
      },
      {
        text: '成长',
        pagePath: '/pages/growth/growth',
        icon: '/images/成长logo-gray.png',
        activeIcon: '/images/成长logo.png'
      },
      {
        text: '我的',
        pagePath: '/pages/profile/profile',
        icon: '/images/我的logo-gray.png',
        activeIcon: '/images/我的logo.png'
      }
    ]
  },

  methods: {
    switchTab(e) {
      const { index, path } = e.currentTarget.dataset
      if (index === this.data.selected) return
      wx.switchTab({ url: path })
    }
  }
})
