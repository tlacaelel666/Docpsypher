using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

// --- 1. Modelos de Datos y Enums ---
// Enum para los tipos de decaimiento, proporcionando seguridad de tipos.
public enum TipoDecaimiento
{
    FISSION,
    ALPHA,
    BETA,
    BETA_GAMMA,
    ALPHA_SF, // Fisión Espontánea y Alfa
    GAMMA,
    DESCONOCIDO
}

// Usamos 'record' para modelos de datos inmutables. Es conciso y eficiente.
public record ElementoRadiactivo(
    double VidaMediaAnos,
    double EnergiaMeV, // Energía en Mega-electronvoltios
    TipoDecaimiento Tipo,
    double Spin
);

public record MapaMorseCuantico(
    string Morse,
    string RepresentacionCuantica,
    string ClaveIsotopo, // La clave para buscar en el diccionario de elementos
    double FaseRadianes
);

// Modelo para una señal individual ya codificada
public record SeñalCodificada(
    char CaracterOriginal,
    MapaMorseCuantico Mapeo,
    ElementoRadiactivo Elemento
);

// Modelo para la firma radiactiva que se calculará
public record FirmaRadiactiva(
    double EnergiaPromedioPonderada,
    double VidaMediaPromedioPonderada,
    Dictionary<TipoDecaimiento, int> ConteoTiposDecaimiento
);

// --- 2. Clase de Configuración Estática ---
// Almacena toda la configuración de forma centralizada y accesible globalmente.
public static class ConfiguracionProtocolo
{
    // Diccionario principal de elementos radiactivos. La clave es el nombre del isótopo.
    public static readonly IReadOnlyDictionary<string, ElementoRadiactivo> ElementosRadiactivos = new Dictionary<string, ElementoRadiactivo>
    {
        { "U235", new(7.038e8, 202.5, TipoDecaimiento.FISSION, 3.5) },      // 7/2 = 3.5
        { "U238", new(4.468e9, 4.27, TipoDecaimiento.ALPHA, 0) },
        { "Pu239", new(2.411e4, 200.0, TipoDecaimiento.FISSION, 0.5) },     // 1/2 = 0.5
        { "Pu238", new(87.7, 5.59, TipoDecaimiento.ALPHA, 0) },
        { "Th232", new(1.405e10, 4.08, TipoDecaimiento.ALPHA, 0) },
        { "Sr90", new(28.8, 0.546, TipoDecaimiento.BETA, 0) },
        { "Co60", new(5.27, 2.82, TipoDecaimiento.BETA_GAMMA, 5) },
        { "Cm244", new(18.1, 5.81, TipoDecaimiento.ALPHA, 0) },
        { "Po210", new(0.38, 5.41, TipoDecaimiento.ALPHA, 0) },
        { "Am241", new(432.6, 5.49, TipoDecaimiento.ALPHA, 2.5) },      // 5/2 = 2.5
        { "Cf252", new(2.65, 6.12, TipoDecaimiento.ALPHA_SF, 0) },
        { "Tc99m", new(0.000068493, 0.14, TipoDecaimiento.GAMMA, 4.5) }, // 6 horas = 0.25 días ~= 0.000068 años, 9/2 = 4.5
        { "vacuum", new(double.PositiveInfinity, 0, TipoDecaimiento.DESCONOCIDO, 0) } // Representación para el espacio
    };

    // Diccionario de mapeo Morse-Cuántico. La clave es el carácter.
    public static readonly IReadOnlyDictionary<char, MapaMorseCuantico> MapaMorse = new Dictionary<char, MapaMorseCuantico>
    {
        {'A', new(".-", "|0⟩|1⟩", "Sr90", 0)},
        {'B', new("-...", "|1⟩|0⟩|0⟩|0⟩", "Co60", Math.PI/4)},
        {'C', new("-.-.", "|1⟩|0⟩|1⟩|0⟩", "Pu238", Math.PI/2)},
        {'D', new("-..", "|1⟩|0⟩|0⟩", "U235", Math.PI/3)},
        {'E', new(".", "|0⟩", "Tc99m", 0)},
        {'F', new("..-.", "|0⟩|0⟩|1⟩|0⟩", "Am241", Math.PI/6)},
        {'G', new("--.", "|1⟩|1⟩|0⟩", "Cm244", Math.PI/5)},
        {'H', new("....", "|0⟩|0⟩|0⟩|0⟩", "Po210", 0)},
        {'I', new("..", "|0⟩|0⟩", "Sr90", Math.PI/8)},
        {'J', new(".---", "|0⟩|1⟩|1⟩|1⟩", "U238", Math.PI/7)},
        {'K', new("-.-", "|1⟩|0⟩|1⟩", "Pu239", Math.PI/4)},
        {'L', new(".-..", "|0⟩|1⟩|0⟩|0⟩", "Th232", Math.PI/3)},
        {'M', new("--", "|1⟩|1⟩", "Cf252", Math.PI/2)},
        {'N', new("-.", "|1⟩|0⟩", "Co60", Math.PI/6)},
        {'O', new("---", "|1⟩|1⟩|1⟩", "U235", 2*Math.PI/3)},
        {'P', new(".--.", "|0⟩|1⟩|1⟩|0⟩", "Am241", Math.PI/5)},
        {'Q', new("--.-", "|1⟩|1⟩|0⟩|1⟩", "Pu238", 3*Math.PI/4)},
        {'R', new(".-.", "|0⟩|1⟩|0⟩", "Sr90", Math.PI/4)},
        {'S', new("...", "|0⟩|0⟩|0⟩", "Tc99m", 0)},
        {'T', new("-", "|1⟩", "Co60", Math.PI)},
        {'U', new("..-", "|0⟩|0⟩|1⟩", "U238", Math.PI/3)},
        {'V', new("...-", "|0⟩|0⟩|0⟩|1⟩", "Cm244", Math.PI/7)},
        {'W', new(".--", "|0⟩|1⟩|1⟩", "Pu239", 2*Math.PI/3)},
        {'X', new("-..-", "|1⟩|0⟩|0⟩|1⟩", "Po210", 3*Math.PI/5)},
        {'Y', new("-.--", "|1⟩|0⟩|1⟩|1⟩", "Cf252", 4*Math.PI/5)},
        {'Z', new("--..", "|1⟩|1⟩|0⟩|0⟩", "Th232", Math.PI/2)},
        {'0', new("-----", "|00000⟩", "U235", 0)},
        {'1', new(".----", "|00001⟩", "Pu239", Math.PI/5)},
        {'2', new("..---", "|00011⟩", "Th232", 2*Math.PI/5)},
        {'3', new("...--", "|00111⟩", "U238", 3*Math.PI/5)},
        {'4', new("....-", "|01111⟩", "Am241", 4*Math.PI/5)},
        {'5', new(".....", "|11111⟩", "Sr90", Math.PI)},
        {'6', new("-....", "|11110⟩", "Co60", 6*Math.PI/5)},
        {'7', new("--...", "|11100⟩", "Cm244", 7*Math.PI/5)},
        {'8', new("---..", "|11000⟩", "Po210", 8*Math.PI/5)},
        {'9', new("----.", "|10000⟩", "Cf252", 9*Math.PI/5)},
        {' ', new("/", "⊗", "vacuum", 0)}, // Espacio entre palabras
        {'.', new(".-.-.-", "...", "Tc99m", 0)},
        {',', new("--..--", ",,,", "Am241", Math.PI/4)},
        {'?', new("..-.--", "???", "Pu238", Math.PI/2)},
        {'!', new("-.-.--", "!!!", "U235", 3*Math.PI/4)}
    };
}


// --- 3. Clase Principal del Protocolo (Expandida y Funcional) ---
public class BiMoTypeProtocol
{
    public long MensajesCodificados { get; private set; } = 0;
    public long ErroresDeCodificacion { get; private set; } = 0;

    /// <summary>
    /// Codifica un mensaje de texto en una secuencia de señales cuántico-radiactivas.
    /// </summary>
    /// <param name="mensaje">El texto a codificar.</param>
    /// <returns>Una lista de objetos SeñalCodificada, o una lista vacía si hay un error.</returns>
    public List<SeñalCodificada> CodificarMensaje(string mensaje)
    {
        var señalesCodificadas = new List<SeñalCodificada>();
        foreach (char caracter in mensaje.ToUpper())
        {
            // Buscamos el carácter en nuestro mapa de configuración.
            if (ConfiguracionProtocolo.MapaMorse.TryGetValue(caracter, out var mapeo))
            {
                // Si se encuentra el mapeo, buscamos el elemento radiactivo correspondiente.
                if (ConfiguracionProtocolo.ElementosRadiactivos.TryGetValue(mapeo.ClaveIsotopo, out var elemento))
                {
                    // Creamos la señal completa y la añadimos a la lista.
                    señalesCodificadas.Add(new SeñalCodificada(caracter, mapeo, elemento));
                }
                else
                {
                    // Error: El isótopo definido en el mapa no existe. Es un error de configuración.
                    Console.WriteLine($"Error de configuración: El isótopo '{mapeo.ClaveIsotopo}' para el carácter '{caracter}' no fue encontrado.");
                    ErroresDeCodificacion++;
                    return new List<SeñalCodificada>(); // Devolver lista vacía en caso de error grave.
                }
            }
            else
            {
                // Error: El carácter no está en nuestro alfabeto.
                Console.WriteLine($"Error de codificación: El carácter '{caracter}' no es soportado por el protocolo.");
                ErroresDeCodificacion++;
                // Opcional: Podrías decidir continuar ignorando el carácter o detenerte. Aquí nos detenemos.
                return new List<SeñalCodificada>();
            }
        }

        MensajesCodificados++;
        return señalesCodificadas;
    }

    /// <summary>
    /// Genera una firma radiactiva única para una carga útil (mensaje).
    /// Esta firma puede usarse para identificación o verificación.
    /// </summary>
    /// <param name="mensaje">El mensaje a partir del cual se generará la firma.</param>
    /// <returns>Un objeto FirmaRadiactiva o null si el mensaje no pudo ser codificado.</returns>
    public FirmaRadiactiva? CrearFirmaRadiactiva(string mensaje)
    {
        var señales = CodificarMensaje(mensaje);
        if (señales == null || señales.Count == 0)
        {
            return null; // No se puede generar una firma de un mensaje vacío o inválido.
        }

        // Excluir los espacios ('vacuum') de los cálculos de promedios energéticos y de vida media.
        var señalesReales = señales.Where(s => s.Elemento.Tipo != TipoDecaimiento.DESCONOCIDO).ToList();
        if (señalesReales.Count == 0) return null;

        // Cálculo de energía promedio ponderada por la energía de cada isótopo.
        double energiaTotal = señalesReales.Sum(s => s.Elemento.EnergiaMeV);
        double energiaPromedio = energiaTotal / señalesReales.Count;

        // Cálculo de vida media ponderada (usando promedio geométrico, más adecuado para órdenes de magnitud variables).
        double productoVidasMedias = señalesReales.Aggregate(1.0, (acc, s) => acc * s.Elemento.VidaMediaAnos);
        double vidaMediaGeometrica = Math.Pow(productoVidasMedias, 1.0 / señalesReales.Count);

        // Conteo de la distribución de tipos de decaimiento.
        var distribucion = señales
            .GroupBy(s => s.Elemento.Tipo)
            .ToDictionary(g => g.Key, g => g.Count());

        return new FirmaRadiactiva(
            EnergiaPromedioPonderada: energiaPromedio,
            VidaMediaPromedioPonderada: vidaMediaGeometrica,
            ConteoTiposDecaimiento: distribucion
        );
    }
}

// --- 4. Programa Principal para Demostración ---
public class Program
{
    public static void Main(string[] args)
    {
        var protocolo = new BiMoTypeProtocol();
        string mensaje = "HOLA MUNDO";

        Console.WriteLine($"--- Codificando el mensaje: '{mensaje}' ---");

        List<SeñalCodificada> señales = protocolo.CodificarMensaje(mensaje);

        if (señales.Any())
        {
            // Imprime la tabla de codificación
            Console.WriteLine("-----------------------------------------------------------------------------------------------------------");
            Console.WriteLine($"| {"Car".PadRight(4)} | {"Morse".PadRight(8)} | {"Isótopo".PadRight(8)} | {"Energía (MeV)".PadRight(15)} | {"Vida Media (Años)".PadRight(20)} | {"Spin".PadRight(5)} | {"Fase".PadRight(12)} |");
            Console.WriteLine("-----------------------------------------------------------------------------------------------------------");
            foreach (var señal in señales)
            {
                Console.WriteLine($"| {señal.CaracterOriginal,-4} | {señal.Mapeo.Morse,-8} | {señal.Mapeo.ClaveIsotopo,-8} | {señal.Elemento.EnergiaMeV,-15:F2} | {señal.Elemento.VidaMediaAnos,-20:E2} | {señal.Elemento.Spin,-5} | {señal.Mapeo.FaseRadianes,-12:F4} |");
            }
            Console.WriteLine("-----------------------------------------------------------------------------------------------------------");

            // Generar y mostrar la firma radiactiva del mensaje
            Console.WriteLine("\n--- Generando Firma Radiactiva del Mensaje ---");
            FirmaRadiactiva? firma = protocolo.CrearFirmaRadiactiva(mensaje);
            if (firma != null)
            {
                Console.WriteLine($"  Energía Promedio Ponderada : {firma.EnergiaPromedioPonderada:F2} MeV");
                Console.WriteLine($"  Vida Media Promedio (Geom.): {firma.VidaMediaPromedioPonderada:E2} Años");
                Console.WriteLine("  Distribución de Decaimientos:");
                foreach (var kvp in firma.ConteoTiposDecaimiento)
                {
                    Console.WriteLine($"    - {kvp.Key}: {kvp.Value} apariciones");
                }
            }
        }
        else
        {
            Console.WriteLine("La codificación falló.");
        }

        Console.WriteLine($"\n--- Métricas del Sistema ---");
        Console.WriteLine($"Mensajes procesados: {protocolo.MensajesCodificados}");
        Console.WriteLine($"Errores de codificación: {protocolo.ErroresDeCodificacion}");
    }
}