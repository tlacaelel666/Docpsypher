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

