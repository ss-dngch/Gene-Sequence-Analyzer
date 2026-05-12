import pandas as pd
import matplotlib.pyplot as plt


def export_mutation_report(mutations, output_file="results/mutation_report.csv"):
    df = pd.DataFrame(mutations)

    df.to_csv(output_file, index=False)

    return output_file


def plot_base_composition(stats, output_file="results/base_composition.png"):
    labels = ["A", "T", "C", "G"]
    values = [stats["A"], stats["T"], stats["C"], stats["G"]]

    plt.figure(figsize=(6, 6))
    plt.bar(labels, values)

    plt.title("Base Composition")
    plt.xlabel("Nucleotide")
    plt.ylabel("Count")

    plt.savefig(output_file)
    plt.close()

    return output_file
