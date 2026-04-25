import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Button,
  Hr,
  Link,
  Preview,
  Row,
  Column,
} from '@react-email/components';

export interface DeliveryEmailProps {
  orderId: string;
  planName: string;
  destination: string;
  dataGb: string;
  durationDays: string;
  qrCodeDataUrl: string;
  smdpAddress: string;
  activationCode: string;
  iosLink?: string;
  androidLink?: string;
  amountPaid: string;
  currency: string;
  discount?: string;
  vat?: string;
  setupGuideUrl: string;
  email: string;
  referralCode?: string;
}

const fontFamily = 'Plus Jakarta Sans, Arial, sans-serif';

const codeBlock = {
  fontFamily: 'monospace',
  backgroundColor: '#F5F5F5',
  padding: '12px',
  borderRadius: '4px',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
};

export function DeliveryEmail({
  orderId,
  planName,
  destination,
  dataGb,
  durationDays,
  qrCodeDataUrl,
  smdpAddress,
  activationCode,
  iosLink,
  androidLink,
  amountPaid,
  currency,
  discount,
  vat,
  setupGuideUrl,
  email,
  referralCode,
}: DeliveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Scan the QR code or tap to install your eSIM</Preview>
      <Body style={{ backgroundColor: '#F6F9FC', margin: 0, padding: '40px 0', fontFamily }}>
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Header bar */}
          <Section
            style={{
              backgroundColor: '#2979FF',
              height: '64px',
              textAlign: 'center',
              padding: '0 20px',
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: '22px',
                fontWeight: 'bold',
                fontFamily,
                margin: 0,
                lineHeight: '64px',
              }}
            >
              eSIM Panda
            </Text>
          </Section>

          {/* Heading */}
          <Section style={{ padding: '32px 40px 0' }}>
            <Text
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#1A1A1A',
                fontFamily,
                margin: 0,
              }}
            >
              Your eSIM is Ready!
            </Text>
          </Section>

          {/* QR Code section */}
          <Section style={{ padding: '24px 40px', textAlign: 'center' }}>
            <Img
              src={qrCodeDataUrl}
              alt="eSIM activation QR code"
              width={200}
              height={200}
              style={{ margin: '0 auto', padding: '16px' }}
            />
            <Text
              style={{
                color: '#666666',
                fontSize: '14px',
                textAlign: 'center',
                fontFamily,
                margin: '8px 0 0',
              }}
            >
              Scan this QR code with your phone camera
            </Text>
          </Section>

          {/* Install links */}
          {(iosLink || androidLink) && (
            <Section style={{ padding: '0 40px 16px', textAlign: 'center' }}>
              {iosLink && (
                <Button
                  href={iosLink}
                  style={{
                    backgroundColor: '#2979FF',
                    color: '#FFFFFF',
                    fontFamily,
                    fontSize: '14px',
                    fontWeight: 'bold',
                    height: '44px',
                    lineHeight: '44px',
                    borderRadius: '6px',
                    padding: '0 24px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    marginRight: androidLink ? '8px' : '0',
                  }}
                >
                  Install on iPhone
                </Button>
              )}
              {androidLink && (
                <Button
                  href={androidLink}
                  style={{
                    backgroundColor: '#2979FF',
                    color: '#FFFFFF',
                    fontFamily,
                    fontSize: '14px',
                    fontWeight: 'bold',
                    height: '44px',
                    lineHeight: '44px',
                    borderRadius: '6px',
                    padding: '0 24px',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Install on Android
                </Button>
              )}
            </Section>
          )}

          {/* Divider */}
          <Hr style={{ borderColor: '#E5E5E5', margin: '24px 40px' }} />

          {/* Manual codes section */}
          <Section style={{ padding: '0 40px' }}>
            <Text
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1A1A1A',
                fontFamily,
                margin: '0 0 8px',
              }}
            >
              Manual Setup
            </Text>
            <Text
              style={{
                fontSize: '14px',
                color: '#666666',
                fontFamily,
                margin: '0 0 16px',
              }}
            >
              If the QR code does not work, enter these details manually in your phone settings
            </Text>

            <Text
              style={{
                fontSize: '12px',
                color: '#999999',
                fontFamily,
                margin: '0 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              SM-DP+ Address
            </Text>
            <Text style={codeBlock}>{smdpAddress}</Text>

            <Text
              style={{
                fontSize: '12px',
                color: '#999999',
                fontFamily,
                margin: '16px 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Activation Code
            </Text>
            <Text style={codeBlock}>{activationCode}</Text>
          </Section>

          {/* Divider */}
          <Hr style={{ borderColor: '#E5E5E5', margin: '24px 40px' }} />

          {/* Order receipt section */}
          <Section style={{ padding: '0 40px' }}>
            <Text
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#1A1A1A',
                fontFamily,
                margin: '0 0 16px',
              }}
            >
              Order Receipt
            </Text>

            <Row>
              <Column style={{ width: '50%' }}>
                <Text style={{ fontSize: '14px', color: '#666666', fontFamily, margin: '4px 0' }}>
                  Order
                </Text>
              </Column>
              <Column style={{ width: '50%' }}>
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#1A1A1A',
                    fontFamily,
                    margin: '4px 0',
                    textAlign: 'right',
                  }}
                >
                  {orderId}
                </Text>
              </Column>
            </Row>

            <Row>
              <Column style={{ width: '50%' }}>
                <Text style={{ fontSize: '14px', color: '#666666', fontFamily, margin: '4px 0' }}>
                  Plan
                </Text>
              </Column>
              <Column style={{ width: '50%' }}>
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#1A1A1A',
                    fontFamily,
                    margin: '4px 0',
                    textAlign: 'right',
                  }}
                >
                  {planName}
                </Text>
              </Column>
            </Row>

            <Row>
              <Column style={{ width: '50%' }}>
                <Text style={{ fontSize: '14px', color: '#666666', fontFamily, margin: '4px 0' }}>
                  Destination
                </Text>
              </Column>
              <Column style={{ width: '50%' }}>
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#1A1A1A',
                    fontFamily,
                    margin: '4px 0',
                    textAlign: 'right',
                  }}
                >
                  {destination}
                </Text>
              </Column>
            </Row>

            <Row>
              <Column style={{ width: '50%' }}>
                <Text style={{ fontSize: '14px', color: '#666666', fontFamily, margin: '4px 0' }}>
                  Data
                </Text>
              </Column>
              <Column style={{ width: '50%' }}>
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#1A1A1A',
                    fontFamily,
                    margin: '4px 0',
                    textAlign: 'right',
                  }}
                >
                  {dataGb} GB / {durationDays} days
                </Text>
              </Column>
            </Row>

            <Hr style={{ borderColor: '#F0F0F0', margin: '8px 0' }} />

            <Row>
              <Column style={{ width: '50%' }}>
                <Text style={{ fontSize: '14px', color: '#666666', fontFamily, margin: '4px 0' }}>
                  Subtotal
                </Text>
              </Column>
              <Column style={{ width: '50%' }}>
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#1A1A1A',
                    fontFamily,
                    margin: '4px 0',
                    textAlign: 'right',
                  }}
                >
                  {currency} {amountPaid}
                </Text>
              </Column>
            </Row>

            {discount && (
              <Row>
                <Column style={{ width: '50%' }}>
                  <Text
                    style={{ fontSize: '14px', color: '#666666', fontFamily, margin: '4px 0' }}
                  >
                    Discount
                  </Text>
                </Column>
                <Column style={{ width: '50%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: '#2979FF',
                      fontFamily,
                      margin: '4px 0',
                      textAlign: 'right',
                    }}
                  >
                    -{currency} {discount}
                  </Text>
                </Column>
              </Row>
            )}

            {vat && (
              <Row>
                <Column style={{ width: '50%' }}>
                  <Text
                    style={{ fontSize: '14px', color: '#666666', fontFamily, margin: '4px 0' }}
                  >
                    VAT
                  </Text>
                </Column>
                <Column style={{ width: '50%' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      color: '#1A1A1A',
                      fontFamily,
                      margin: '4px 0',
                      textAlign: 'right',
                    }}
                  >
                    {currency} {vat}
                  </Text>
                </Column>
              </Row>
            )}

            <Hr style={{ borderColor: '#F0F0F0', margin: '8px 0' }} />

            <Row>
              <Column style={{ width: '50%' }}>
                <Text
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1A1A1A',
                    fontFamily,
                    margin: '4px 0',
                  }}
                >
                  Total
                </Text>
              </Column>
              <Column style={{ width: '50%' }}>
                <Text
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1A1A1A',
                    fontFamily,
                    margin: '4px 0',
                    textAlign: 'right',
                  }}
                >
                  {currency} {amountPaid}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Setup guide button */}
          <Section style={{ padding: '24px 40px', textAlign: 'center' }}>
            <Button
              href={setupGuideUrl}
              style={{
                backgroundColor: '#2979FF',
                color: '#FFFFFF',
                fontFamily,
                fontSize: '14px',
                fontWeight: 'bold',
                height: '44px',
                lineHeight: '44px',
                borderRadius: '6px',
                padding: '0 32px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              View Setup Guide
            </Button>
          </Section>

          {/* Divider */}
          <Hr style={{ borderColor: '#E5E5E5', margin: '0 40px' }} />

          {/* Referral footer */}
          <Section style={{ padding: '20px 40px', textAlign: 'center' }}>
            <Link
              href={referralCode ? `https://esimpanda.com/r/${referralCode}` : 'https://esimpanda.com'}
              style={{
                fontSize: '14px',
                color: '#666666',
                fontFamily,
                textDecoration: 'none',
              }}
            >
              {referralCode
                ? 'Share with a friend — you both get a free 1GB plan!'
                : 'Know someone traveling? Share eSIM Panda'}
            </Link>
          </Section>

          {/* Legal footer */}
          <Section style={{ padding: '0 40px 24px', textAlign: 'center' }}>
            <Text
              style={{
                fontSize: '12px',
                color: '#999999',
                fontFamily,
                margin: 0,
              }}
            >
              eSIM Panda
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default DeliveryEmail;
