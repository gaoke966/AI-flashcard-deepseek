import { Component } from 'react'
import { View, Text, Button, Input } from '@tarojs/components'
import { Modal } from '@tarojs/weapp'
import Taro from '@tarojs/taro'
import { storage } from '../../utils/storage'
import './index.scss'

interface Props {
  onApiKeyChange?: (apiKey: string) => void
}

interface State {
  isOpened: boolean
  apiKey: string
}

export default class SettingsDialog extends Component<Props, State> {
  private modal: any

  constructor(props) {
    super(props)
    this.state = {
      isOpened: false,
      apiKey: ''
    }
  }

  componentDidMount() {
    this.loadApiKey()
  }

  loadApiKey = () => {
    try {
      const apiKey = storage.get('apiKey', '')
      this.setState({ apiKey })
    } catch (error) {
      console.error('加载API密钥失败:', error)
    }
  }

  handleOpen = () => {
    this.setState({ isOpened: true })
  }

  handleClose = () => {
    this.setState({ isOpened: false })
  }

  handleApiKeyChange = (e) => {
    this.setState({ apiKey: e.detail.value })
  }

  handleSave = () => {
    const { apiKey } = this.state
    
    try {
      const success = storage.set('apiKey', apiKey)
      if (success) {
        if (this.props.onApiKeyChange) {
          this.props.onApiKeyChange(apiKey)
        }
        this.handleClose()
        Taro.showToast({
          title: '设置已保存',
          icon: 'success',
          duration: 2000
        })
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      console.error('保存API密钥失败:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'error',
        duration: 2000
      })
    }
  }

  render() {
    const { isOpened, apiKey } = this.state

    return (
      <View className='settings-dialog'>
        <View className='settings-button' onClick={this.handleOpen}>
          <Text className='settings-icon'>⚙️</Text>
        </View>

        <Modal 
          title='设置'
          show={isOpened} 
          onClose={this.handleClose}
          className='settings-modal'
        >
          <View className='settings-content'>
            <View className='setting-item'>
              <Text className='setting-label'>Deepseek API 密钥:</Text>
              <Input
                password
                placeholder='请输入您的API密钥'
                value={apiKey}
                onInput={this.handleApiKeyChange}
                className='setting-input'
              />
            </View>
            <View className='setting-help'>
              <Text className='help-text'>
                获取API密钥请访问: https://platform.deepseek.com/
              </Text>
            </View>
          </View>
          
          <View className='modal-actions'>
            <Button onClick={this.handleClose}>取消</Button>
            <Button type='primary' onClick={this.handleSave}>保存</Button>
          </View>
        </Modal>
      </View>
    )
  }
}