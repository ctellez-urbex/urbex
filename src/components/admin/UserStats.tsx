'use client'

import { Users, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react'
import { User } from '@/lib/cognito-admin'

interface UserStatsProps {
  users: User[]
}

export function UserStats({ users }: UserStatsProps) {
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.status === 'active').length
  const inactiveUsers = users.filter(user => user.status === 'disabled').length
  const pendingUsers = users.filter(user => user.status === 'pending').length
  const monthlyPlanUsers = users.filter(user => user.plan === 'Mensual').length
  
  // Calculate users who logged in within the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentActiveUsers = users.filter(user => 
    user.lastLogin && new Date(user.lastLogin) > thirtyDaysAgo
  ).length

  const stats = [
    {
      title: 'Total de Usuarios',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Usuarios Activos',
      value: activeUsers,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Usuarios Inactivos',
      value: inactiveUsers,
      icon: UserX,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Plan Mensual',
      value: monthlyPlanUsers,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
                {index === 0 && totalUsers > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {((activeUsers / totalUsers) * 100).toFixed(1)}% activos
                  </p>
                )}
                {index === 1 && totalUsers > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {recentActiveUsers} activos este mes
                  </p>
                )}
                {index === 2 && totalUsers > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {pendingUsers} pendientes
                  </p>
                )}
                {index === 3 && totalUsers > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {((monthlyPlanUsers / totalUsers) * 100).toFixed(1)}% del total
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
} 