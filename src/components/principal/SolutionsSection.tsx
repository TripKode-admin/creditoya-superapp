import React from "react";
import { 
  GraduationCap, 
  Home, 
  Wrench, 
  Wallet, 
  Palmtree, 
  Car, 
  Stethoscope, 
  Heart 
} from "lucide-react";

function SolutionSelection() {
  const creditOptions = [
    {
      title: "Créditos Educativos",
      description: "Préstamos diseñados para financiar estudios académicos, incluyendo matrícula, libros y otros gastos relacionados.",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-blue-600 dark:text-blue-400",
      iconBgColor: "bg-blue-100 dark:bg-blue-900",
      icon: <GraduationCap size={40} className="text-blue-500 dark:text-blue-300" />
    },
    {
      title: "Crédito Vivienda Ahorro Programado",
      description: "Préstamos para la adquisición de vivienda con un plan de ahorro programado.",
      bgColor: "bg-green-50 dark:bg-gray-700",
      textColor: "text-green-600 dark:text-green-400",
      iconBgColor: "bg-green-100 dark:bg-green-900",
      icon: <Home size={40} className="text-green-500 dark:text-green-300" />
    },
    {
      title: "Crédito Vivienda Adecuación",
      description: "Préstamos para la compra de vivienda o reparaciones locativas.",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-purple-600 dark:text-purple-400",
      iconBgColor: "bg-purple-100 dark:bg-purple-900",
      icon: <Wrench size={40} className="text-purple-500 dark:text-purple-300" />
    },
    {
      title: "Libre Inversión y/o Consumo",
      description: "Préstamos para cualquier tipo de inversión o consumo personal.",
      bgColor: "bg-green-50 dark:bg-gray-700",
      textColor: "text-amber-600 dark:text-amber-400",
      iconBgColor: "bg-amber-100 dark:bg-amber-900",
      icon: <Wallet size={40} className="text-amber-500 dark:text-amber-300" />
    },
    {
      title: "Crédito Apoyo Actividades Lucrativas",
      description: "Préstamos para financiar actividades recreativas y de ocio.",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-teal-600 dark:text-teal-400",
      iconBgColor: "bg-teal-100 dark:bg-teal-900",
      icon: <Palmtree size={40} className="text-teal-500 dark:text-teal-300" />
    },
    {
      title: "Crédito Transporte",
      description: "Préstamos para la compra de vehículos de transporte personal o comercial.",
      bgColor: "bg-green-50 dark:bg-gray-700",
      textColor: "text-indigo-600 dark:text-indigo-400",
      iconBgColor: "bg-indigo-100 dark:bg-indigo-900",
      icon: <Car size={40} className="text-indigo-500 dark:text-indigo-300" />
    },
    {
      title: "Crédito para Complemento en Salud",
      description: "Préstamos para cubrir gastos médicos y de salud.",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-red-600 dark:text-red-400",
      iconBgColor: "bg-red-100 dark:bg-red-900",
      icon: <Stethoscope size={40} className="text-red-500 dark:text-red-300" />
    },
    {
      title: "Crédito para Complemento Funerarios",
      description: "Préstamos para cubrir necesidades financieras familiares o personales.",
      bgColor: "bg-green-50 dark:bg-gray-700",
      textColor: "text-pink-600 dark:text-pink-400",
      iconBgColor: "bg-pink-100 dark:bg-pink-900",
      icon: <Heart size={40} className="text-pink-500 dark:text-pink-300" />
    }
  ];

  return (
    <main className="min-h-dvh px-[5%] pt-20 dark:bg-gray-900">
      <div className="space-y-2 mb-16">
        <h3 className="font-semibold text-center text-xl sm:text-5xl text-gray-700 dark:text-gray-200">
          Soluciones Financieras a Tu Alcance
        </h3>
        <p className="text-center text-sm sm:text-base font-thin text-gray-600 dark:text-gray-300">
          Préstamos Rápidos y Flexibles para Impulsar Tus Metas Financieras
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* First row - two cards */}
        <div className={`md:col-span-5 ${creditOptions[0].bgColor} p-8 rounded-lg relative shadow-sm min-h-64 cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.01] group`}>
          <div className="flex items-start mb-4">
            <div className={`${creditOptions[0].iconBgColor} p-3 rounded-lg shadow-sm mr-4`}>
              {creditOptions[0].icon}
            </div>
            <div>
              <h4 className={`text-2xl font-semibold ${creditOptions[0].textColor} mb-2 group-hover:translate-x-1 transition-transform duration-300`}>
                {creditOptions[0].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {creditOptions[0].description}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br from-blue-400 to-purple-500 group-hover:opacity-20 transition-opacity"></div>
        </div>

        <div className={`md:col-span-7 ${creditOptions[1].bgColor} p-8 rounded-lg relative shadow-sm min-h-64 cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.01] group`}>
          <div className="flex items-start mb-4">
            <div className={`${creditOptions[1].iconBgColor} p-3 rounded-lg shadow-sm mr-4`}>
              {creditOptions[1].icon}
            </div>
            <div>
              <h4 className={`text-2xl font-semibold ${creditOptions[1].textColor} mb-2 group-hover:translate-x-1 transition-transform duration-300`}>
                {creditOptions[1].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {creditOptions[1].description}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br from-green-400 to-teal-500 group-hover:opacity-20 transition-opacity"></div>
        </div>

        {/* Second row - two cards */}
        <div className={`md:col-span-7 ${creditOptions[2].bgColor} p-8 rounded-lg relative shadow-sm min-h-64 cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.01] group`}>
          <div className="flex items-start mb-4">
            <div className={`${creditOptions[2].iconBgColor} p-3 rounded-lg shadow-sm mr-4`}>
              {creditOptions[2].icon}
            </div>
            <div>
              <h4 className={`text-2xl font-semibold ${creditOptions[2].textColor} mb-2 group-hover:translate-x-1 transition-transform duration-300`}>
                {creditOptions[2].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {creditOptions[2].description}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br from-purple-400 to-indigo-500 group-hover:opacity-20 transition-opacity"></div>
        </div>

        <div className={`md:col-span-5 ${creditOptions[3].bgColor} p-8 rounded-lg relative shadow-sm min-h-64 cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.01] group`}>
          <div className="flex items-start mb-4">
            <div className={`${creditOptions[3].iconBgColor} p-3 rounded-lg shadow-sm mr-4`}>
              {creditOptions[3].icon}
            </div>
            <div>
              <h4 className={`text-2xl font-semibold ${creditOptions[3].textColor} mb-2 group-hover:translate-x-1 transition-transform duration-300`}>
                {creditOptions[3].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {creditOptions[3].description}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br from-amber-400 to-orange-500 group-hover:opacity-20 transition-opacity"></div>
        </div>

        {/* Third row - three cards */}
        <div className={`md:col-span-4 ${creditOptions[4].bgColor} p-8 rounded-lg relative shadow-sm min-h-64 cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.01] group`}>
          <div className="flex items-start mb-4">
            <div className={`${creditOptions[4].iconBgColor} p-3 rounded-lg shadow-sm mr-4`}>
              {creditOptions[4].icon}
            </div>
            <div>
              <h4 className={`text-2xl font-semibold ${creditOptions[4].textColor} mb-2 group-hover:translate-x-1 transition-transform duration-300`}>
                {creditOptions[4].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {creditOptions[4].description}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br from-teal-400 to-cyan-500 group-hover:opacity-20 transition-opacity"></div>
        </div>

        <div className={`md:col-span-4 ${creditOptions[5].bgColor} p-8 rounded-lg relative shadow-sm min-h-64 cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.01] group`}>
          <div className="flex items-start mb-4">
            <div className={`${creditOptions[5].iconBgColor} p-3 rounded-lg shadow-sm mr-4`}>
              {creditOptions[5].icon}
            </div>
            <div>
              <h4 className={`text-2xl font-semibold ${creditOptions[5].textColor} mb-2 group-hover:translate-x-1 transition-transform duration-300`}>
                {creditOptions[5].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {creditOptions[5].description}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br from-indigo-400 to-blue-500 group-hover:opacity-20 transition-opacity"></div>
        </div>

        <div className={`md:col-span-4 ${creditOptions[6].bgColor} p-8 rounded-lg relative shadow-sm min-h-64 cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.01] group`}>
          <div className="flex items-start mb-4">
            <div className={`${creditOptions[6].iconBgColor} p-3 rounded-lg shadow-sm mr-4`}>
              {creditOptions[6].icon}
            </div>
            <div>
              <h4 className={`text-2xl font-semibold ${creditOptions[6].textColor} mb-2 group-hover:translate-x-1 transition-transform duration-300`}>
                {creditOptions[6].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {creditOptions[6].description}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br from-red-400 to-pink-500 group-hover:opacity-20 transition-opacity"></div>
        </div>

        {/* Fourth row - one card */}
        <div className={`md:col-span-12 ${creditOptions[7].bgColor} p-8 rounded-lg relative shadow-sm min-h-64 cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden hover:scale-[1.01] group`}>
          <div className="flex items-start mb-4">
            <div className={`${creditOptions[7].iconBgColor} p-3 rounded-lg shadow-sm mr-4`}>
              {creditOptions[7].icon}
            </div>
            <div>
              <h4 className={`text-2xl font-semibold ${creditOptions[7].textColor} mb-2 group-hover:translate-x-1 transition-transform duration-300`}>
                {creditOptions[7].title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                {creditOptions[7].description}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br from-pink-400 to-rose-500 group-hover:opacity-20 transition-opacity"></div>
        </div>
      </div>
    </main>
  );
}

export default SolutionSelection;