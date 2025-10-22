import React from 'react'
import { 
  Heading, 
  Body, 
  Button, 
  Card, 
  Stack 
} from '@joseph-ehler/wizard-react'

export default function SimpleTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Simple Test</h1>
      <Card>
        <Stack spacing="normal">
          <Heading size="lg">Design System Test</Heading>
          <Body>If you can read this with proper styling, the design system is working!</Body>
          <Button variant="primary">Test Button</Button>
        </Stack>
      </Card>
    </div>
  )
}
