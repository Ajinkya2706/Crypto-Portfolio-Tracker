'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, DollarSign, Save } from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  balance: number
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/portfolio')
        const data = await response.json()
        
        if (data.success && data.data.user) {
          setUser(data.data.user)
          setFormData({
            name: data.data.user.name || '',
            email: data.data.user.email || ''
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, you'd have an API endpoint to update user profile
      alert('Profile update feature coming soon!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details and balance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium">Available Balance</p>
                  <p className="text-sm text-gray-500">${user?.balance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-gray-500">Demo Trading Account</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Preferences</CardTitle>
          <CardDescription>Configure your trading settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle between light and dark themes</p>
              </div>
              <p className="text-sm text-gray-500">Use the toggle in the header</p>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Trading Fees</p>
                <p className="text-sm text-gray-500">Current fee structure</p>
              </div>
              <p className="text-sm text-gray-500">0.1% per trade</p>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Starting Balance</p>
                <p className="text-sm text-gray-500">Initial demo account balance</p>
              </div>
              <p className="text-sm text-gray-500">$10,000</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}