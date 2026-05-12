def calculate_stats(sequence):
    sequence = sequence.upper()

    length = len(sequence)

    a_count = sequence.count("A")
    t_count = sequence.count("T")
    c_count = sequence.count("C")
    g_count = sequence.count("G")

    gc_content = ((g_count + c_count) / length) * 100
    at_content = ((a_count + t_count) / length) * 100

    return {
        "length": length,
        "A": a_count,
        "T": t_count,
        "C": c_count,
        "G": g_count,
        "GC_content": round(gc_content, 2),
        "AT_content": round(at_content, 2),
    }
