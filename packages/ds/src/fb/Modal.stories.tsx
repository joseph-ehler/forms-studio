import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useState } from 'react';

import { Button } from './Button';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'DS/FB/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Modal>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal
          ariaLabel="Example Modal"
          open={open}
          onClose={() => setOpen(false)}
        >
          <Modal.Header>Example Modal</Modal.Header>
          <Modal.Body>
            <p className="text-base leading-relaxed text-gray-500">
              This is a basic modal example with header and body content.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Accept
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Click open button
    await userEvent.click(await canvas.findByText('Open Modal'));
    
    // Verify modal appeared
    const modalBody = await canvas.findByText(/basic modal example/i);
    await expect(modalBody).toBeInTheDocument();
  },
};

export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Create User</Button>
        <Modal
          ariaLabel="Create User"
          open={open}
          onClose={() => setOpen(false)}
        >
          <Modal.Header>Create New User</Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Create
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};

export const SmallSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Small Modal</Button>
        <Modal
          ariaLabel="Small Modal"
          open={open}
          onClose={() => setOpen(false)}
          size="sm"
        >
          <Modal.Header>Small Modal</Modal.Header>
          <Modal.Body>
            <p className="text-sm text-gray-500">
              This is a small modal.
            </p>
          </Modal.Body>
        </Modal>
      </div>
    );
  },
};

export const LargeSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Large Modal</Button>
        <Modal
          ariaLabel="Large Modal"
          open={open}
          onClose={() => setOpen(false)}
          size="xl"
        >
          <Modal.Header>Large Modal</Modal.Header>
          <Modal.Body>
            <p className="text-base text-gray-500">
              This is a large modal with more content space. You can put more detailed information here.
            </p>
            <p className="mt-4 text-base text-gray-500">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
};
