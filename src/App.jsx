import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  useEffect(() => {
    async function cargarPreguntas() {
      // Pedimos las preguntas directamente a Supabase
      const { data, error } = await supabase
        .from('preguntas')
        .select('*')
        .eq('encuesta_id', 1)
        .order('id', { ascending: true });
        
      if (error) {
        console.error("Error al cargar preguntas:", error);
      } else {
        setPreguntas(data);
      }
    }
    
    cargarPreguntas();
  }, []);

  const handleChange = (preguntaId, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sesionActual = 'usuario_' + Date.now();
    
    // Preparamos el arreglo de respuestas
    const arrayRespuestas = Object.keys(respuestas).map(key => ({
      pregunta_id: parseInt(key),
      sesion_usuario: sesionActual,
      valor_respuesta: respuestas[key]
    }));

    // Insertamos todas las respuestas en la tabla de Supabase
    const { error } = await supabase
      .from('respuestas')
      .insert(arrayRespuestas);

    if (error) {
      console.error("Error al enviar respuestas:", error);
      alert('Hubo un error al conectar con la base de datos.');
    } else {
      alert('¡Encuesta enviada con éxito a la nube!');
      setRespuestas({});
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Evaluación de Usabilidad</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {preguntas.length === 0 && <p className="text-center text-gray-500">Cargando instrumento...</p>}
        
        {preguntas.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {p.seccion && (
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">
                {p.seccion}
              </span>
            )}
            
            <label className="block text-lg font-medium text-gray-800 mb-4">
              {p.texto_pregunta}
            </label>
            
            {p.tipo_pregunta === 'texto' && (
              <input 
                type="text"
                className="w-full border-gray-300 rounded-md p-3 border focus:ring-blue-500 focus:border-blue-500"
                value={respuestas[p.id] || ''}
                onChange={(e) => handleChange(p.id, e.target.value)}
              />
            )}

            {p.tipo_pregunta === 'area_texto' && (
              <textarea 
                rows="4"
                className="w-full border-gray-300 rounded-md p-3 border focus:ring-blue-500 focus:border-blue-500"
                value={respuestas[p.id] || ''}
                onChange={(e) => handleChange(p.id, e.target.value)}
              />
            )}

            {p.tipo_pregunta === 'select' && (
              <select 
                className="w-full border-gray-300 rounded-md p-3 border focus:ring-blue-500 bg-white"
                value={respuestas[p.id] || ''}
                onChange={(e) => handleChange(p.id, e.target.value)}
                required
              >
                <option value="" disabled>Seleccione una opción...</option>
                {p.opciones?.split(',').map((opt, index) => (
                  <option key={index} value={opt.trim()}>{opt.trim()}</option>
                ))}
              </select>
            )}

            {p.tipo_pregunta === 'radio' && (
              <div className="flex gap-6">
                {p.opciones?.split(',').map((opt, index) => (
                  <label key={index} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name={`pregunta_${p.id}`} 
                      value={opt.trim()}
                      checked={respuestas[p.id] === opt.trim()}
                      onChange={(e) => handleChange(p.id, e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      required
                    />
                    <span className="text-gray-700">{opt.trim()}</span>
                  </label>
                ))}
              </div>
            )}

            {p.tipo_pregunta === 'likert' && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-sm text-gray-500 hidden sm:block">Totalmente en desacuerdo</span>
                <div className="flex gap-4 sm:gap-8">
                  {p.opciones?.split(',').map((opt, index) => (
                    <label key={index} className="flex flex-col items-center cursor-pointer">
                      <input 
                        type="radio" 
                        name={`pregunta_${p.id}`} 
                        value={opt.trim()}
                        checked={respuestas[p.id] === opt.trim()}
                        onChange={(e) => handleChange(p.id, e.target.value)}
                        className="w-5 h-5 mb-2 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="text-sm font-medium text-gray-700">{opt.trim()}</span>
                    </label>
                  ))}
                </div>
                <span className="text-sm text-gray-500 hidden sm:block">Totalmente de acuerdo</span>
              </div>
            )}
          </div>
        ))}
        
        {preguntas.length > 0 && (
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
          >
            Enviar Evaluación
          </button>
        )}
      </form>
    </div>
  );
}