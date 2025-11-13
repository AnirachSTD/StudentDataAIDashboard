import React, { useMemo, useState } from 'react';
import { Student } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import DataTable from './DataTable';
import { TableIcon } from './icons/TableIcon';

interface DashboardProps {
  data: Student[];
  theme: 'light' | 'dark';
}

const LIGHT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899', '#6366f1', '#d946ef', '#22c55e'];
const DARK_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#2dd4bf', '#f472b6', '#818cf8', '#e879f9', '#4ade80'];


const Dashboard: React.FC<DashboardProps> = ({ data, theme }) => {
  const [showYearTable, setShowYearTable] = useState(false);
  const [showGpaTable, setShowGpaTable] = useState(false);
  const [showStatusTable, setShowStatusTable] = useState(false);
  const [showCurriculumTable, setShowCurriculumTable] = useState(false);

  const COLORS = theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const chartTextColor = 'var(--foreground)';
  const chartGridColor = 'var(--border)';
  const chartTooltipBg = 'var(--card)';
  const chartTooltipBorder = 'var(--border)';


  const { statusData, gpaData, totalStudents, averageGpa, studentsPerYearData, uniqueCurriculums, studentsPerCurriculumData, probationData } = useMemo(() => {
    if (!data || data.length === 0) {
      return { statusData: [], gpaData: [], totalStudents: 0, averageGpa: 0, studentsPerYearData: [], uniqueCurriculums: [], studentsPerCurriculumData: [], probationData: { total: 0, byCurriculum: [] } };
    }

    const statusCounts = data.reduce((acc: { [key: string]: number }, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1;
      return acc;
    }, {});

    const statusChartData = Object.entries(statusCounts).map(([name, value]: [string, number]) => ({
        name,
        value,
        percentage: (data.length > 0 ? (value / data.length) * 100 : 0).toFixed(2),
    }));
    
    const uniqueCurriculums = [...new Set(data.map(s => s.curriculum || 'Uncategorized'))].sort();

    const gpaBuckets: { [key: string]: { [key: string]: number, total: number } } = {
        '< 2.0': { total: 0 },
        '2.0-2.49': { total: 0 },
        '2.5-2.99': { total: 0 },
        '3.0-3.49': { total: 0 },
        '>= 3.5': { total: 0 },
    };
    // FIX: Explicitly type `c` as string to avoid type inference issues.
    uniqueCurriculums.forEach((c: string) => {
        Object.keys(gpaBuckets).forEach(bucket => {
            gpaBuckets[bucket][c] = 0;
        });
    });

    let totalGpa = 0;
    data.forEach(student => {
        totalGpa += student.gpax;
        const curriculum = student.curriculum || 'Uncategorized';
        let bucket = '';
        if(student.gpax < 2.0) bucket = '< 2.0';
        else if(student.gpax < 2.5) bucket = '2.0-2.49';
        else if(student.gpax < 3.0) bucket = '2.5-2.99';
        else if(student.gpax < 3.5) bucket = '3.0-3.49';
        else bucket = '>= 3.5';
        
        gpaBuckets[bucket][curriculum]++;
        gpaBuckets[bucket].total++;
    });

    const gpaChartData = Object.entries(gpaBuckets).map(([name, counts]) => {
        return { 
            name, 
            ...counts
        };
    });

    const avgGpa = data.length > 0 ? (totalGpa / data.length) : 0;
    
    const studentsPerYearCounts = data.reduce((acc: { [key: string]: { 'All Curriculums': number; [key: string]: number } }, student) => {
        const year = student.academicYear || 'Uncategorized';
        const curriculum = student.curriculum || 'Uncategorized';

        if (!acc[year]) {
            acc[year] = { 'All Curriculums': 0 };
            // FIX: Explicitly type `c` as string to avoid type inference issues.
            uniqueCurriculums.forEach((c: string) => {
                acc[year][c] = 0;
            });
        }

        acc[year]['All Curriculums']++;
        acc[year][curriculum]++;

        return acc;
    }, {});

    const studentsPerYearChartData = Object.entries(studentsPerYearCounts)
        .map(([year, counts]: [string, { 'All Curriculums': number; [key: string]: number }]) => {
            const rowData: { [key: string]: string | number } = {
                name: year,
                'All Curriculums': counts['All Curriculums']
            };
            // FIX: Explicitly type `curriculum` as string to avoid type inference issues.
            uniqueCurriculums.forEach((curriculum: string) => {
                rowData[curriculum] = counts[curriculum] || 0;
            });
            return rowData;
        })
        .sort((a,b) => (a.name as string).localeCompare(b.name as string));
    
    const studentsPerCurriculumCounts = data.reduce((acc: { [key: string]: number }, student) => {
      const curriculum = student.curriculum || 'Uncategorized';
      acc[curriculum] = (acc[curriculum] || 0) + 1;
      return acc;
    }, {});

    const studentsPerCurriculumChartData = Object.entries(studentsPerCurriculumCounts)
        .map(([name, students]: [string, number]) => {
            return {
                name, 
                students,
                percentage: (data.length > 0 ? (students / data.length) * 100 : 0).toFixed(2)
            };
        })
        .sort((a,b) => b.students - a.students);

    const probationStudents = data.filter(student => student.gpax < 2.0 && student.status === 'ปกติ');
    const probationByCurriculum = probationStudents.reduce((acc: { [key: string]: number }, student) => {
        const curriculum = student.curriculum || 'Uncategorized';
        acc[curriculum] = (acc[curriculum] || 0) + 1;
        return acc;
    }, {});
    const sortedProbationByCurriculum = Object.entries(probationByCurriculum).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);

    const calculatedProbationData = {
        total: probationStudents.length,
        byCurriculum: sortedProbationByCurriculum,
    };

    return { statusData: statusChartData, gpaData: gpaChartData, totalStudents: data.length, averageGpa: avgGpa, studentsPerYearData: studentsPerYearChartData, uniqueCurriculums, studentsPerCurriculumData: studentsPerCurriculumChartData, probationData: calculatedProbationData };
  }, [data]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
              <CardHeader>
                  <CardTitle>Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">{totalStudents}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Average GPAX</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">{Number(averageGpa).toFixed(2)}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Status Categories</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">{statusData.length}</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle>Probation Students</CardTitle>
                  <CardDescription className="text-xs">Status "ปกติ" &amp; GPAX &lt; 2.0</CardDescription>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">{probationData.total}</p>
                  <div className="mt-2 space-y-1">
                      {probationData.byCurriculum.length > 0 ? (
                          probationData.byCurriculum.slice(0, 5).map(([curriculum, count]) => (
                              <div key={curriculum as string} className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground truncate" title={curriculum as string}>{curriculum}</span>
                                  <span className="font-medium flex-shrink-0 ml-2">{count}</span>
                              </div>
                          ))
                      ) : (
                          <p className="text-sm text-muted-foreground">No students on probation.</p>
                      )}
                  </div>
              </CardContent>
          </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-3">
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Students per Academic Year (by Sheet)</CardTitle>
                      <CardDescription>Total student count and breakdown by curriculum.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowYearTable(true)}>
                        <TableIcon className="h-4 w-4 mr-2" />
                        View Data
                    </Button>
                  </div>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={studentsPerYearData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                          <XAxis dataKey="name" stroke={chartTextColor} />
                          <YAxis allowDecimals={false} stroke={chartTextColor} />
                          <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, color: chartTextColor }} />
                          <Legend wrapperStyle={{ color: chartTextColor }}/>
                          <Line type="monotone" dataKey="All Curriculums" name="All Curriculums" stroke={theme === 'dark' ? DARK_COLORS[1] : LIGHT_COLORS[1]} strokeWidth={2} activeDot={{ r: 8 }} />
                          {uniqueCurriculums.map((curriculum, index) => (
                              <Line
                                  key={curriculum}
                                  type="monotone"
                                  dataKey={curriculum}
                                  name={curriculum}
                                  stroke={COLORS[(index + 2) % COLORS.length]}
                                  strokeWidth={1.5}
                                  strokeDasharray="3 3"
                                  activeDot={{ r: 6 }}
                              />
                          ))}
                      </LineChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
          <Card className="lg:col-span-3">
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Student Status Overview</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setShowStatusTable(true)}>
                        <TableIcon className="h-4 w-4 mr-2" />
                        View Data
                    </Button>
                  </div>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                          <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={130}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                          >
                              {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, color: chartTextColor }}
                            formatter={(value: number, name: string, props: any) => {
                                const percentage = props.payload.percentage;
                                return [`${value} (${percentage}%)`, name];
                            }}
                          />
                      </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {statusData.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center text-sm">
                            <span
                                className="h-3 w-3 mr-2 rounded-sm"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span>{`${entry.name} (${entry.value} / ${entry.percentage}%)`}</span>
                        </div>
                    ))}
                </div>
              </CardContent>
          </Card>
          <Card className="lg:col-span-2">
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>GPAX Distribution</CardTitle>
                        <CardDescription>Stacked by curriculum.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowGpaTable(true)}>
                        <TableIcon className="h-4 w-4 mr-2" />
                        View Data
                    </Button>
                  </div>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={gpaData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                          <XAxis dataKey="name" stroke={chartTextColor} />
                          <YAxis stroke={chartTextColor} allowDecimals={false} />
                          <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, color: chartTextColor }} />
                          <Legend wrapperStyle={{ color: chartTextColor }}/>
                          {uniqueCurriculums.map((curriculum, index) => (
                              <Bar 
                                key={curriculum} 
                                dataKey={curriculum} 
                                stackId="a" 
                                fill={COLORS[index % COLORS.length]} 
                                name={curriculum} 
                              />
                          ))}
                      </BarChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
          <Card className="lg:col-span-1">
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Students per Curriculum</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setShowCurriculumTable(true)}>
                        <TableIcon className="h-4 w-4 mr-2" />
                        View Data
                    </Button>
                  </div>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={studentsPerCurriculumData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} stroke={chartTextColor} />
                          <YAxis allowDecimals={false} stroke={chartTextColor} />
                          <Tooltip contentStyle={{ backgroundColor: chartTooltipBg, borderColor: chartTooltipBorder, color: chartTextColor }} />
                          <Legend wrapperStyle={{ color: chartTextColor }} />
                          <Bar dataKey="students" fill={theme === 'dark' ? DARK_COLORS[2] : LIGHT_COLORS[2]} name="Number of Students" />
                      </BarChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
      </div>

      <Modal isOpen={showYearTable} onClose={() => setShowYearTable(false)} title="Students per Academic Year Data">
          <DataTable 
            headers={['Academic Year', 'All Curriculums', ...uniqueCurriculums]}
            rows={studentsPerYearData.map(d => [
                d.name, 
                d['All Curriculums'], 
                // FIX: Explicitly type `c` as string to avoid type inference issues.
                ...uniqueCurriculums.map((c: string) => d[c] || 0)
            ])}
          />
      </Modal>

      <Modal isOpen={showGpaTable} onClose={() => setShowGpaTable(false)} title="GPAX Distribution Data">
          <DataTable 
            headers={['GPAX Range', ...uniqueCurriculums, 'Total']}
            rows={gpaData.map(d => [
                d.name,
                // FIX: Explicitly type `c` as string to avoid type inference issues.
                ...uniqueCurriculums.map((c: string) => d[c] || 0),
                d.total
            ])}
          />
      </Modal>

      <Modal isOpen={showStatusTable} onClose={() => setShowStatusTable(false)} title="Student Status Overview Data">
          <DataTable 
            headers={['Status', 'Number of Students', 'Percentage']}
            rows={statusData.map(d => [d.name, d.value, `${d.percentage}%`])}
          />
      </Modal>

      <Modal isOpen={showCurriculumTable} onClose={() => setShowCurriculumTable(false)} title="Students per Curriculum Data">
          <DataTable 
            headers={['Curriculum', 'Number of Students', 'Percentage']}
            rows={studentsPerCurriculumData.map(d => [d.name, d.students, `${d.percentage}%`])}
          />
      </Modal>
    </>
  );
};

export default Dashboard;