import { useState, useEffect } from 'react'
import { Layout, Flex, Row, Col, Typography, Card, Menu, Button, notification, Statistic, Space, Result } from 'antd';
import { PayCircleOutlined, LogoutOutlined, PlusSquareOutlined, GiftOutlined, HistoryOutlined, UserOutlined } from '@ant-design/icons';
import numeral from 'numeral';
import axios from 'axios';
import moment from 'moment';
import io from 'socket.io-client';
import { isMobile } from 'react-device-detect';

import LogoImg from './assets/logo.png'

const { Header, Content, Footer } = Layout;
const { Countdown } = Statistic;

const AMOUNTS = [5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, 20000000, 50000000];
const PAYMENT_STATUS = {
  creating: 1,
  waiting: 2,
  done: 3,
}

function App() {
  const [api, contextHolder] = notification.useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(AMOUNTS[0]);
  const [status, setStatus] = useState(PAYMENT_STATUS.creating);

  useEffect(() => {
    return () => {
      if (window.socket) {
        window.socket?.disconnect();
      }
    }
  }, [])

  const connectWS = (paymentId) => {
    const socket = io.connect(import.meta.env.VITE_API_END_POINT, {
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 60000,
      reconnectionAttempts: 'Infinity',
      timeout: 10000,
      query: `paymentId=${paymentId}`,
    });
    window.socket = socket;
    socket.on('UPDATE_PAYMENT_STATUS', (data) => {
      setStatus(() => data?.status);
      if (data?.status === PAYMENT_STATUS.done) {
        socket.disconnect();
        window.newWindow?.close();
        api.success({
          message: 'Nạp tiền thành công',
          description: 'Số tiền đã được cộng vào tài khoản của bạn!',
        })
      }
    });
  }

  const createPaymentIntent = async () => {
    setIsLoading(true);
    try {
      const payment = {
        amount,
        redirectUrl: window.location.href
      }
      const response = await axios.post(`${import.meta.env.VITE_API_END_POINT}/create-payment-intent`, payment);

      const url = response.data?.paymentIntent?.paymentUrl;
      const name = 'Nạp tiền';
      const options = 'left=0,top=0,width=1324,height=760';

      if (isMobile) {
        window.location.href = url
      } else {
        connectWS(response.data?.payment?.id);
        window.newWindow = window.open(url, name, options);
      }

      setStatus(PAYMENT_STATUS.waiting);
    } catch (error) {
      api.error({
        message: 'Thất bại',
        description: 'Đã có lỗi xảy ra!',
      })
    } finally {
      setIsLoading(false);
    }
  }

  const cancelPayment = () => {
    window.newWindow?.close();
    setStatus(PAYMENT_STATUS.creating);
  }

  const onTimeout = () => {
    setStatus(PAYMENT_STATUS.creating);
  }

  return (
    <Layout>
      {contextHolder}
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Flex align='center' gap={6}>
          <img src={LogoImg} width="36px" />
          <div style={{ color: 'white', fontSize: '26px', fontWeight: 600 }}>BestGate</div>
        </Flex>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={[
            { key: '1', label: 'Casino' },
            { key: '2', label: 'Bắn cá' },
            { key: '3', label: 'Đá gà' },
            { key: '4', label: 'Nổ hũ' },
            { key: '5', label: 'Thể thao' },
            { key: '6', label: 'Game bài' },
            { key: '7', label: 'Sổ xố' },
            { key: '8', label: 'Khuyễn mãi' },
            { key: '9', label: 'Đại lý' },
          ]}
          style={{ flex: 1, minWidth: 0, justifyContent: 'end' }}
        />
      </Header>
      <Content className='content'>
        <Layout
          style={{ padding: '24px' }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={5} xl={5}>
              <Menu
                mode="inline"
                selectedKeys={['2']}
                style={{
                  height: '100%',
                  borderInlineEnd: 'none'
                }}
                items={[
                  { key: '1', icon: <UserOutlined />, label: 'Tài khoản' },
                  { key: '2', icon: <PayCircleOutlined />, label: 'Nạp tiền' },
                  { key: '3', icon: <LogoutOutlined />, label: 'Rút tiền' },
                  { key: '4', icon: <PlusSquareOutlined />, label: 'Giới thiệu bạn bè' },
                  { key: '5', icon: <GiftOutlined />, label: 'Trung tâm phần thưởng' },
                  { key: '6', icon: <HistoryOutlined />, label: 'Lịch sử trò chơi' },
                ]}
              />
            </Col>
            <Col xs={24} lg={19} xl={19}>

              <Card
                bordered={false}
                title="Nạp tiền qua cổng thanh toán BestGate"
                style={{ minHeight: 'calc(100vh - 210px)' }}
              >
                <Row gutter={48}>
                  <Col xs={24} md={12}>
                    <Flex vertical gap={12}>
                      <Card>
                        <Flex vertical gap={24}>
                          {status === PAYMENT_STATUS.creating && (
                            <>
                              <Typography.Text strong>Số tiền</Typography.Text>
                              <Flex gap="small" wrap="wrap">
                                {AMOUNTS.map((_amount) => {
                                  return (
                                    <Button
                                      key={_amount}
                                      type={_amount === amount ? 'primary' : 'default'}
                                      style={{ width: '120px' }}
                                      onClick={() => setAmount(_amount)}
                                    >
                                      {`${numeral(_amount).format('0,0')}đ`}
                                    </Button>
                                  )
                                })}
                              </Flex>
                              <Button
                                size='large'
                                type="primary"
                                loading={isLoading}
                                onClick={createPaymentIntent}
                              >
                                Nạp
                              </Button>
                              <Typography.Text type="danger">
                                Lời nhắc nhở: Mỗi lần giao dịch không nên vượt quá 300 triệu để bảo đảm ngân hàng của bạn không bị ngân hàng nhà nước kiểm soát, giao dịch dưới 300 triệu bảo đảm mức an toàn. Hãy chú ý bảo mật thông tin của mình.
                              </Typography.Text>
                            </>
                          )}
                          {status === PAYMENT_STATUS.waiting && (
                            <>
                              <Typography.Text>
                                {`Vui lòng thanh toán trong cửa sổ bật lên. Hãy chắc chắn đợi cho đến khi trang "Thanh toán thành công" xuất hiện trước khi đóng trang.`}
                              </Typography.Text>
                              <Card bordered>
                                <Space>
                                  <Countdown
                                    valueStyle={{ color: 'red', fontSize: '18px', fontWeight: 'bold' }}
                                    value={moment().add(15, 'minutes').valueOf()}
                                    onFinish={onTimeout}
                                    format="mm:ss"
                                  />
                                  <Typography.Text>Thời gian xác nhận thông tin gửi tiền</Typography.Text>
                                </Space>
                              </Card>
                              <Typography.Text>
                                Nhắc bạn: Lỗi hoặc hủy vé của bạn có thể dẫn đến tạm ngưng tài khoản
                              </Typography.Text>
                              <Button
                                type='primary'
                                size='large'
                                onClick={cancelPayment}
                              >
                                Đóng
                              </Button>
                            </>
                          )}
                          {status === PAYMENT_STATUS.done && (
                            <>
                              <Result
                                status="success"
                                title="Nạp tiền thành công!"
                                subTitle="Số tiền đã được cộng vào tài khoản của bạn!"
                                extra={[
                                  <Button type="primary" key="console" onClick={() => { setStatus(PAYMENT_STATUS.creating) }}>
                                    Giao dịch mới
                                  </Button>,
                                ]}
                              />
                            </>
                          )}

                        </Flex>
                      </Card>
                    </Flex>

                  </Col>
                  <Col xs={24} md={12}>
                    <Flex vertical>
                      <Typography.Title level={5} style={{ marginTop: '12px' }}>
                        Lưu ý:
                      </Typography.Title>
                      <Typography.Text level={5} style={{ marginTop: '12px' }}>
                        * Nạp tiền làm lệnh và chuyển khoản ghi đúng Nội Dung hệ thống yêu cầu sẽ cập nhật điểm nhanh.
                      </Typography.Text>
                      <Typography.Text level={5} style={{ marginTop: '12px' }}>
                        * Thông tin người nhận của BestGate cập nhật liên tục, vì vậy hãy vào mục Nạp Tiền lấy thông tin mới nhất thanh toán.
                      </Typography.Text>
                      <Typography.Text level={5} style={{ marginTop: '12px' }}>
                        * Không nạp tiền qua tài khoản cá nhân của người thứ ba, người giới thiệu, đại lý.
                      </Typography.Text>
                      <Typography.Text level={5} style={{ marginTop: '12px' }}>
                        * Cẩn trọng, lưu ý khi cung cấp hóa đơn nạp tiền thành công cho người thứ ba, người giới thiệu, đại lý.
                      </Typography.Text>
                      <Typography.Text level={5} style={{ marginTop: '12px' }}>
                        * Trường hợp nạp không thành công hay bị từ chối lên điểm, vui lòng liên hệ Chăm Sóc Khách Hàng.
                      </Typography.Text>
                    </Flex>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Layout>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Copyright ©{new Date().getFullYear()} BestGate. All right reserved
      </Footer>
    </Layout>
  )
}

export default App
