csharp
using System.Collections.Generic;
using System.Numerics; // Added for Complex number support if needed later

public static class BiMoTypeData
{
    public static List<RadioactiveElement> RadioactiveElements { get; } = new List<RadioactiveElement>()
    {
        new RadioactiveElement { Isotope = "U235", HalfLifeYears = 7.038e8, Energy = 202.5, Type = "Fission", Spin = 7/2.0 },
        new RadioactiveElement { Isotope = "Pu239", HalfLifeYears = 2.411e4, Energy = 200.0, Type = "Fission", Spin = 1/2.0 },
        new RadioactiveElement { Isotope = "Sr90", HalfLifeYears = 28.8, Energy = 0.546, Type = "Beta", Spin = 0 },
        // Add more radioactive elements as needed
    };

    public static List<MorseQuantumMapping> MorseQuantumMap { get; } = new List<MorseQuantumMapping>()
    {
        new MorseQuantumMapping { Character = "A", Morse = ".-", QuantumRepresentation = "|0⟩|1⟩", Isotope = "Sr90", Phase = 0 },
        new MorseQuantumMapping { Character = "B", Morse = "-...", QuantumRepresentation = "|1⟩|0⟩|0⟩|0⟩", Isotope = "Co60", Phase = System.Math.PI / 4.0 }, // Use System.Math.PI for Pi
        new MorseQuantumMapping { Character = "C", Morse = "-.-.", QuantumRepresentation = "|1⟩|0⟩|1⟩|0⟩", Isotope = "Pu238", Phase = System.Math.PI / 2.0 },
        // Add more morse quantum mappings as needed
    };
}