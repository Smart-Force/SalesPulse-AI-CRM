import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart, FunnelChart, Funnel, LabelList, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { DollarSign, Zap, Clock, Trophy, ArrowUp, ArrowDown, Target } from 'lucide-react';
import { salesPerformanceData, funnelData, leaderboardData, dealSourceData, recentDealsData } from '../data/analyticsData';

const MetricCard = ({ title, value, change, changeType, icon: Icon, iconBgColor }: { title: string, value: string, change: string, changeType: 'up' | 'down', icon: React.ElementType, iconBgColor: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">{title}</CardTitle>
      <div className={`p-2 rounded-full ${iconBgColor}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">{value}</div>
      <p className={`text-sm mt-2 ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {changeType === 'up' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />}
        {change} from last period
      </p>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
                <p className="font-bold text-gray-800 dark:text-slate-200">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color }}>
                        {`${p.name}: ${p.name === 'Revenue' ? '$' : ''}${p.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


export const Analytics: React.FC = () => {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Analytics & Reporting</h1>
        <p className="mt-1 text-gray-600 dark:text-slate-400">Dive deep into your sales data to uncover insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Deals Won (YTD)" value="342" change="+15.2%" changeType="up" icon={Trophy} iconBgColor="bg-green-500" />
        <MetricCard title="Sales Velocity" value="42 days" change="-3 days" changeType="up" icon={Zap} iconBgColor="bg-blue-500" />
        <MetricCard title="Average Deal Size" value="$18,750" change="+8.1%" changeType="up" icon={DollarSign} iconBgColor="bg-yellow-500" />
        <MetricCard title="Lead Response Time" value="2.1 hours" change="+0.2h" changeType="down" icon={Clock} iconBgColor="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <p className="text-sm text-gray-500 dark:text-slate-400">Monthly revenue and deals won over the last year.</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={salesPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="Revenue" fill="#3b82f6" name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="Deals" stroke="#10b981" name="Deals Won" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Sales Funnel Analysis</CardTitle>
                <p className="text-sm text-gray-500 dark:text-slate-400">Conversion rates through the sales pipeline.</p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <FunnelChart>
                        <Tooltip />
                        <Funnel dataKey="value" data={funnelData} isAnimationActive>
                           <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                           <LabelList position="center" fill="#fff" stroke="none" dataKey="value" formatter={(value: number) => value.toLocaleString()} />
                        </Funnel>
                    </FunnelChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
                <CardTitle>Sales Leaderboard</CardTitle>
                 <p className="text-sm text-gray-500 dark:text-slate-400">Top performers by revenue this quarter.</p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={leaderboardData} layout="vertical">
                         <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="Revenue" fill="#8884d8" name="Revenue" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Deal Source Effectiveness</CardTitle>
                <p className="text-sm text-gray-500 dark:text-slate-400">Comparing performance across lead channels.</p>
            </CardHeader>
             <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dealSourceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} />
                        <Radar name="Lead Gen Tool" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name="Website" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Radar name="Referral" dataKey="C" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
             </CardContent>
          </Card>
       </div>
       
       <Card>
            <CardHeader>
                <CardTitle>Recent Deals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Prospect</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Deal Size</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Close Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Sales Rep</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                            {recentDealsData.map((deal) => (
                                <tr key={deal.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{deal.prospectName}</div>
                                        <div className="text-sm text-gray-500 dark:text-slate-400">{deal.company}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">${deal.dealSize.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${deal.status === 'Won' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {deal.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{deal.closeDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{deal.salesRep}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
       </Card>
    </div>
  );
};
