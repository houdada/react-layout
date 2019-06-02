import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Header from '@/components/header/header'
import Footer from '@/components/footer/footer'
import AlertTip from '@/components/alert_tip/alert_tip'
import { is, fromJS } from 'immutable';  // 保证数据的不可变
import QueueAnim from 'rc-queue-anim'
import {saveUserInfo} from '@/store/action'
import {getStore} from '@/utils/commons'
import {getImgPath} from '../../utils/commons'
import API from '../../api/api'
import './profile.scss'

class Profile extends Component {
  static propTypes = {
    userInfo: PropTypes.object.isRequired,
    saveUserInfo: PropTypes.func.isRequired,
  }
  state = {
    username: '登录/注册',
    mobile: '暂无绑定手机',
    imgpath: '',   // 图片路径
    balance: 0,     //我的余额
    count : 0,       //优惠券个数
    pointNumber : 0, //积分数
    hasAlert: '',   // tip是否显示
    alertText: '请在手机APP中打开',
  }
  // 初始化数据
  initData  = () => {
    let newState = {}
    if (this.props.userInfo && this.props.userInfo.user_id) {
      newState.mobile = this.props.userInfo.mobile || '暂无手机绑定'
      newState.username = this.props.userInfo.username
      newState.balance = this.props.userInfo.balance
      newState.count = this.props.userInfo.gift_amount
      newState.pointNumber = this.props.userInfo.point
    } else {
      newState.mobile = '暂无手机绑定'
      newState.username = '登录/注册'
    }
    this.setState(newState)
  }
  handleClick = (type) =>{
    let alertText
    switch (type){
      case 'download':
        alertText = '请到官方网站下载'
        break
      case 'unfinished':
        alertText = '功能尚未开发'
        break
      default:
    }
    this.setState({
      hasAlert: !this.state.hasAlert,
      alertText,
    })
  }
  // 获取用户信息
  getUserInfo = async () => {
    let userInfo = await API.getUser({user_id: getStore('user_id')})
    userInfo.imgpath = userInfo.avatar.indexOf('/') !== -1? '/img/' + userInfo.avatar:getImgPath()
    this.props.saveUserInfo(userInfo)
    this.initData()  
  }
  goBack = () => {
    this.props.history.goBack()
  }
  componentDidMount () {
    if (!this.props.userInfo.user_id) {
      this.getUserInfo()
    } else {
      this.initData()  
    }
  }
  componentWillReceiveProps(nextProps){  // 属性props改变时候触发
    if(!is(fromJS(this.props.proData), fromJS(nextProps.proData))){   //
      this.initData(nextProps);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {   // 判断是否要更新render, return true 更新  return false不更新
    return !is(fromJS(this.props), fromJS(nextProps)) || !is(fromJS(this.state),fromJS(nextState))
  }
  render () {
    return (
      <div className='profile-container'>
      <QueueAnim type='bottom'>
        <Header title="我的" goBack={this.goBack}  key='s1'/>
        <section  key='s2'>
            <section className='profile-number' >
              <Link to={this.props.userInfo&&this.props.userInfo.user_id?'/info':'/login'} className='profile-link'>
                <img src={this.props.userInfo.imgpath} alt='img is wrong' className='private-image'/>
                <div className='user-info'>
                  <div>{this.state.username}</div>
                  <div>
                    <div className='icon-tel'></div>
                    <span className='icon-mobile-number'>{this.state.mobile}</span>
                  </div>
                </div>
                <div className='icon-arrow-right'>
                </div>
              </Link>
            </section>
           
          <section className='profile-list'>
          <QueueAnim deley='0.4'>          
           {this.props.children}
        </QueueAnim>
          </section>
        </section>
        <Footer key='s3'/>
        </QueueAnim>
      {this.state.hasAlert&&<AlertTip logout={()=> {return false}}  closeTip={this.handleClick} alertText={this.state.alertText}/>}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.userInfo
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveUserInfo: (userInfo) => dispatch(saveUserInfo(userInfo))
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Profile)