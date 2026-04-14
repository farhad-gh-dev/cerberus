import type { Meta, StoryObj } from '@storybook/react-vite'
import type { PeerInfo } from '@shared/types'
import { PeerCard } from './peer-card'

const meta: Meta<typeof PeerCard> = {
  title: 'Components/PeerCard',
  component: PeerCard,
  argTypes: {
    onToggle: { action: 'toggle' }
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    )
  ]
}

export default meta
type Story = StoryObj<typeof PeerCard>

const activePeer: PeerInfo = {
  id: '1',
  address: '192.168.1.42',
  port: 51413,
  client: 'qBittorrent/4.5.2',
  downloadSpeed: 1.5 * 1024 * 1024,
  uploadSpeed: 256 * 1024,
  downloaded: 150 * 1024 * 1024,
  uploaded: 20 * 1024 * 1024,
  progress: 0.85,
  location: {
    lat: 51.5074,
    lon: -0.1278,
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'gb',
    isp: 'BT Group'
  }
}

const idlePeer: PeerInfo = {
  id: '2',
  address: '10.0.0.15',
  port: 6881,
  client: 'Transmission/3.0',
  downloadSpeed: 0,
  uploadSpeed: 0,
  downloaded: 50 * 1024 * 1024,
  uploaded: 10 * 1024 * 1024,
  progress: 0.3,
  location: {
    lat: 48.8566,
    lon: 2.3522,
    city: 'Paris',
    country: 'France',
    countryCode: 'fr',
    isp: 'Orange S.A.'
  }
}

const unknownLocationPeer: PeerInfo = {
  id: '3',
  address: '203.0.113.50',
  port: 12345,
  client: 'Unknown Client',
  downloadSpeed: 512 * 1024,
  uploadSpeed: 0,
  downloaded: 80 * 1024 * 1024,
  uploaded: 5 * 1024 * 1024,
  progress: 0.45
}

export const Active: Story = {
  args: {
    peer: activePeer,
    isExpanded: false
  }
}

export const ActiveExpanded: Story = {
  args: {
    peer: activePeer,
    isExpanded: true
  }
}

export const Idle: Story = {
  args: {
    peer: idlePeer,
    isExpanded: false
  }
}

export const UnknownLocation: Story = {
  args: {
    peer: unknownLocationPeer,
    isExpanded: false
  }
}

export const UnknownLocationExpanded: Story = {
  args: {
    peer: unknownLocationPeer,
    isExpanded: true
  }
}
