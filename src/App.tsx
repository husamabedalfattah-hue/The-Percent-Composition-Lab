import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trash2, Calculator, HelpCircle } from 'lucide-react';

type Mode = 'mass' | 'molar';

interface ElementData {
  id: string;
  name: string;
  color: string;
  atomicMass: number;
  bgColor: string;
}

const ELEMENTS: ElementData[] = [
  { id: 'C', name: 'Carbon', color: '#1f2937', bgColor: 'bg-gray-800', atomicMass: 12.011 },
  { id: 'H', name: 'Hydrogen', color: '#60a5fa', bgColor: 'bg-blue-400', atomicMass: 1.008 },
  { id: 'O', name: 'Oxygen', color: '#ef4444', bgColor: 'bg-red-500', atomicMass: 15.999 },
  { id: 'N', name: 'Nitrogen', color: '#f59e0b', bgColor: 'bg-amber-500', atomicMass: 14.007 }
];

export default function App() {
  const [mode, setMode] = useState<Mode>('mass');
  const [inputs, setInputs] = useState<Record<string, number>>({
    C: 0,
    H: 0,
    O: 0,
    N: 0
  });

  const handleInputChange = (id: string, value: string) => {
    const num = parseFloat(value);
    setInputs(prev => ({
      ...prev,
      [id]: isNaN(num) ? 0 : Math.max(0, num)
    }));
  };

  const resetInputs = () => {
    setInputs({ C: 0, H: 0, O: 0, N: 0 });
  };

  const elementMasses = useMemo(() => {
    const masses: Record<string, number> = {};
    ELEMENTS.forEach(el => {
      const val = inputs[el.id] || 0;
      masses[el.id] = mode === 'mass' ? val : val * el.atomicMass;
    });
    return masses;
  }, [inputs, mode]);

  const totalMass = useMemo(() => {
    return Object.values(elementMasses).reduce((sum, mass) => sum + mass, 0);
  }, [elementMasses]);

  const percentages = useMemo(() => {
    const percs: Record<string, number> = {};
    ELEMENTS.forEach(el => {
      percs[el.id] = totalMass > 0 ? (elementMasses[el.id] / totalMass) * 100 : 0;
    });
    return percs;
  }, [elementMasses, totalMass]);

  const chartData = useMemo(() => {
    return ELEMENTS.filter(el => elementMasses[el.id] > 0).map(el => ({
      name: el.name,
      value: percentages[el.id],
      color: el.color
    }));
  }, [elementMasses, percentages]);

  const fillHeight = Math.min((totalMass / 200) * 100, 100);

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-3 font-display">
            The Percent Composition Simulation Lab
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto italic">
            "Explore how different elements combine to form compounds. Adjust the mass or number of atoms to see how each element contributes to the total composition!"
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Panel: The Ingredients (Inputs) */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6 text-slate-700 border-b pb-4 font-display">
              Step 1: Add Ingredients
            </h2>
            
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
              <button 
                onClick={() => setMode('mass')} 
                className={`flex-1 py-2 rounded-lg font-bold transition ${mode === 'mass' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                By Mass (g)
              </button>
              <button 
                onClick={() => setMode('molar')} 
                className={`flex-1 py-2 rounded-lg font-bold transition ${mode === 'molar' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                By Molar Mass (Formula)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Element Inputs */}
              {ELEMENTS.map(el => (
                <div key={el.id} className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent transition-all hover:border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-10 h-10 flex items-center justify-center ${el.bgColor} text-white rounded-lg font-bold`}>
                      {el.id}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight">{el.name}</p>
                      {mode === 'molar' && (
                        <p className="text-xs text-slate-500 italic">
                          Molar Mass: {el.atomicMass.toFixed(3)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={inputs[el.id] || ''} 
                      min="0" 
                      onChange={(e) => handleInputChange(el.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition pr-16"
                    />
                    <span className="absolute right-4 top-4 text-slate-400 font-bold">
                      {mode === 'mass' ? 'g' : 'atoms'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button 
                onClick={resetInputs} 
                className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear Elements
              </button>
            </div>
          </div>

          {/* Right Panel: Visual Results */}
          <div className="flex flex-col gap-8">
            {/* The Visual Bowl */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-6 text-slate-700 self-start font-display">
                The Composition Beaker
              </h2>
              <div className="relative w-[280px] h-[160px] bg-white border-[6px] border-slate-300 rounded-b-[140px] overflow-hidden shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] mb-6">
                <div 
                  className="absolute bottom-0 w-full flex flex-col-reverse transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                  style={{ height: `${fillHeight}%` }}
                >
                  {ELEMENTS.map(el => {
                    const layerHeight = totalMass > 0 ? (elementMasses[el.id] / totalMass) * 100 : 0;
                    if (layerHeight === 0) return null;
                    return (
                      <div 
                        key={el.id} 
                        className="w-full transition-all duration-500 ease-in-out"
                        style={{ backgroundColor: el.color, height: `${layerHeight}%` }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="text-center">
                <span className="text-4xl font-extrabold text-slate-800">{totalMass.toFixed(1)}</span>
                <span className="text-xl font-bold text-slate-400 ml-1">
                  {mode === 'mass' ? 'g' : 'g/mol'}
                </span>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mt-1">
                  {mode === 'mass' ? 'Total Sample Mass' : 'Compound Molar Mass'}
                </p>
              </div>
            </div>

            {/* The Data Chart */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <h2 className="text-2xl font-semibold mb-6 text-slate-700 font-display">
                Percent Composition
              </h2>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="h-40">
                  {totalMass > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={70}
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={2}
                          isAnimationActive={false}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-slate-400 text-sm italic text-center">Add ingredients to see the pie chart!</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {totalMass > 0 ? (
                    ELEMENTS.map(el => {
                      if (elementMasses[el.id] === 0 && totalMass === 0) return null;
                      const percentage = percentages[el.id] || 0;
                      if (percentage === 0) return null;
                      return (
                        <div key={el.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-bold" style={{ color: el.color }}>{el.id}</span>
                          <span className="text-sm font-black text-slate-800">{percentage.toFixed(1)}%</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-400 text-sm italic">Add grams to see the pie chart!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Live Math Substitutions */}
        <div className="mt-10 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-slate-700 flex items-center gap-2 font-display">
            <Calculator className="w-6 h-6 text-blue-500" />
            Live Math Substitutions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
            {totalMass > 0 ? (
              ELEMENTS.map(el => {
                if (elementMasses[el.id] === 0) return null;
                const percentage = percentages[el.id] || 0;
                const inputValue = inputs[el.id] || 0;
                
                return (
                  <div key={el.id} className="p-4 bg-slate-50 rounded-xl border-l-4 shadow-sm flex flex-col justify-center" style={{ borderColor: el.color }}>
                    <div className="text-xs text-slate-500 mb-1 font-sans font-bold">{el.name} Percentage:</div>
                    <div className="text-slate-700 overflow-x-auto whitespace-nowrap flex items-center gap-2">
                      <span className="font-bold">% {el.id}</span> = {' '}
                      {mode === 'mass' ? (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <span className="text-blue-600 font-bold border-b-2 border-slate-400 px-2 leading-tight">{inputValue}g</span>
                            <span className="text-slate-800 font-bold px-2 leading-tight">{totalMass.toFixed(1)}g</span>
                          </div>
                          <span>× 100 =</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <span className="text-blue-600 font-bold border-b-2 border-slate-400 px-2 leading-tight">
                              {inputValue} atoms × <span className="text-emerald-600">{el.atomicMass.toFixed(3)}</span>
                            </span>
                            <span className="text-slate-800 font-bold px-2 leading-tight">{totalMass.toFixed(1)}</span>
                          </div>
                          <span>× 100 =</span>
                        </div>
                      )}
                      <span className="font-bold text-lg" style={{ color: el.color }}>{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 italic col-span-full">Add ingredients to see the math formulas in action!</p>
            )}
          </div>
        </div>

        {/* Educational Footer */}
        <div className="mt-10 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 font-display">
            <span className="bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
              <HelpCircle className="w-5 h-5" />
            </span>
            What is happening?
          </h3>
          <div className="grid grid-cols-1 gap-8 text-slate-600 leading-relaxed">
            {mode === 'mass' ? (
              <div>
                <p className="mb-2">
                  <strong>% by Mass of Element:</strong> You are adding raw physical amounts (grams). The total mass is simply the sum of all grams added. Every percentage is a fraction of the total mixture.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl font-mono text-sm border-l-4 border-blue-500 font-bold text-blue-900 flex items-center gap-2">
                  <span>% by mass =</span>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="border-b-2 border-blue-900 px-2 leading-tight">Mass of Element</span>
                      <span className="px-2 leading-tight">Total Sample Mass</span>
                    </div>
                    <span>× 100</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2">
                  <strong>% by Molar Mass of Element:</strong> You are building a chemical formula! You are defining how many <em>atoms</em> of each element exist in the compound. The system multiplies the number of atoms by their atomic weights to find the total molar mass.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl font-mono text-sm border-l-4 border-emerald-500 font-bold text-emerald-900 flex items-center gap-2">
                  <span>% by molar mass =</span>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="border-b-2 border-emerald-900 px-2 leading-tight">Atoms × Atomic Mass</span>
                      <span className="px-2 leading-tight">Compound Molar Mass</span>
                    </div>
                    <span>× 100</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pb-8 text-center">
          <p className="text-md text-slate-500 font-medium">Created by <span className="text-blue-600 font-bold">Husam Abed Al-Fattah</span></p>
        </div>
      </div>
    </div>
  );
}

