# Searching and Sorting Algorithms

---

## 🧠 Binary Search

### Core Idea

Binary Search works on **sorted arrays**.  
It repeatedly divides the search interval in half — compare the target with the middle element:

- If equal → found

- If smaller → search left

- If larger → search right

### **Time Complexity**

- **Best:** O(1)

- **Average/Worst:** O(log n)

- **Space:** O(1)

---

### **Python Code**

```python
# binary_search.py

def binary_search(arr, target):
    """Performs binary search on a sorted list."""
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1  # not found

# Example usage
if __name__ == "__main__":
    data = [2, 4, 6, 8, 10, 12]
    print("Index of 8:", binary_search(data, 8))     # Example 1
    print("Index of 3:", binary_search(data, 3))     # Example 2
```

---

### **Java Code**

```java
// BinarySearch.java
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = (low + high) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1; // not found
    }

    public static void main(String[] args) {
        int[] data = {2, 4, 6, 8, 10, 12};
        System.out.println("Index of 8: " + binarySearch(data, 8)); // Example 1
        System.out.println("Index of 3: " + binarySearch(data, 3)); // Example 2
    }
}
```

---

## 🧠 Linear Search

### **Core Idea**

Check every element until the target is found or the list ends.

### **Time Complexity**

- **Best:** O(1)

- **Worst:** O(n)

- **Space:** O(1)

---

### **Python Code**

```python
# linear_search.py

def linear_search(arr, target):
    """Performs linear search."""
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

if __name__ == "__main__":
    data = [5, 10, 15, 20]
    print("Index of 15:", linear_search(data, 15))   # Example 1
    print("Index of 100:", linear_search(data, 100)) # Example 2
```

---

### **Java Code**

```java
// LinearSearch.java
public class LinearSearch {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target)
                return i;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] data = {5, 10, 15, 20};
        System.out.println("Index of 15: " + linearSearch(data, 15));   // Example 1
        System.out.println("Index of 100: " + linearSearch(data, 100)); // Example 2
    }
}
```

---

## 🧠 Merge Sort

### **Core Idea**

Divide the array into halves, sort each half recursively, and merge the two sorted halves.

### **Time Complexity**

- **All Cases:** O(n log n)

- **Space:** O(n)

---

### **Python Code**

```python
# merge_sort.py

def merge_sort(arr):
    """Performs merge sort recursively."""
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    """Merges two sorted lists."""
    merged, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged

if __name__ == "__main__":
    print("Sorted:", merge_sort([38, 27, 43, 3, 9, 82, 10]))  # Example 1
    print("Sorted:", merge_sort([5, 2, 4, 6, 1, 3]))          # Example 2
```

---

### **Java Code**

```java
// MergeSort.java
import java.util.Arrays;

public class MergeSort {
    public static void mergeSort(int[] arr, int l, int r) {
        if (l < r) {
            int mid = (l + r) / 2;
            mergeSort(arr, l, mid);
            mergeSort(arr, mid + 1, r);
            merge(arr, l, mid, r);
        }
    }

    private static void merge(int[] arr, int l, int m, int r) {
        int n1 = m - l + 1, n2 = r - m;
        int[] L = new int[n1];
        int[] R = new int[n2];
        for (int i = 0; i < n1; i++) L[i] = arr[l + i];
        for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

        int i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            if (L[i] <= R[j]) arr[k++] = L[i++];
            else arr[k++] = R[j++];
        }
        while (i < n1) arr[k++] = L[i++];
        while (j < n2) arr[k++] = R[j++];
    }

    public static void main(String[] args) {
        int[] data1 = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(data1, 0, data1.length - 1);
        System.out.println("Sorted: " + Arrays.toString(data1));

        int[] data2 = {5, 2, 4, 6, 1, 3};
        mergeSort(data2, 0, data2.length - 1);
        System.out.println("Sorted: " + Arrays.toString(data2));
    }
}
```

---

## 🧠 Quick Sort

### **Core Idea**

Pick a **pivot**, partition the array into elements smaller and larger than the pivot, then recursively sort the partitions.

### **Time Complexity**

- **Best/Average:** O(n log n)

- **Worst:** O(n²) (rare, e.g. sorted input with poor pivot)

- **Space:** O(log n)

---

### **Python Code**

```python
# quick_sort.py

def quick_sort(arr):
    """Performs quick sort using recursion."""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

if __name__ == "__main__":
    print("Sorted:", quick_sort([10, 7, 8, 9, 1, 5]))    # Example 1
    print("Sorted:", quick_sort([3, 6, 8, 10, 1, 2, 1])) # Example 2
```

---

### **Java Code**

```java
// QuickSort.java
import java.util.Arrays;

public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = (low - 1);
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            }
        }
        int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
        return i + 1;
    }

    public static void main(String[] args) {
        int[] data1 = {10, 7, 8, 9, 1, 5};
        quickSort(data1, 0, data1.length - 1);
        System.out.println("Sorted: " + Arrays.toString(data1));

        int[] data2 = {3, 6, 8, 10, 1, 2, 1};
        quickSort(data2, 0, data2.length - 1);
        System.out.println("Sorted: " + Arrays.toString(data2));
    }
}
```

---

## 🧠 Heap Sort

### **Core Idea**

Heap sort builds a **max heap** (largest at top) and repeatedly swaps the root with the last element, shrinking the heap size.

### **Time Complexity**

- **All Cases:** O(n log n)

- **Space:** O(1)

---

### **Python Code**

```python
# heap_sort.py

def heapify(arr, n, i):
    """Ensure max heap property at index i."""
    largest = i
    left, right = 2*i + 1, 2*i + 2

    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    """Performs heap sort."""
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)
    return arr

if __name__ == "__main__":
    print("Sorted:", heap_sort([12, 11, 13, 5, 6, 7]))  # Example 1
    print("Sorted:", heap_sort([4, 10, 3, 5, 1]))       # Example 2
```

---

### **Java Code**

```java
// HeapSort.java
import java.util.Arrays;

public class HeapSort {
    public static void heapSort(int[] arr) {
        int n = arr.length;
        // Build max heap
        for (int i = n / 2 - 1; i >= 0; i--)
            heapify(arr, n, i);
        // Extract elements
        for (int i = n - 1; i >= 0; i--) {
            int temp = arr[0];
            arr[0] = arr[i];
            arr[i] = temp;
            heapify(arr, i, 0);
        }
    }

    private static void heapify(int[] arr, int n, int i) {
        int largest = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;

        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;

        if (largest != i) {
            int swap = arr[i];
            arr[i] = arr[largest];
            arr[largest] = swap;
            heapify(arr, n, largest);
        }
    }

    public static void main(String[] args) {
        int[] data1 = {12, 11, 13, 5, 6, 7};
        heapSort(data1);
        System.out.println("Sorted: " + Arrays.toString(data1));

        int[] data2 = {4, 10, 3, 5, 1};
        heapSort(data2);
        System.out.println("Sorted: " + Arrays.toString(data2));
    }
}
```

---

## 🧠 Counting Sort

### **Core Idea**

Counting Sort works only on **integers (or discrete values)**.  
Instead of comparing elements, it **counts** occurrences of each value and reconstructs the sorted array.  
It is best when the **range (max - min)** of numbers is not too large compared to `n`.

---

### **Python Code**

```python
# COUNTING SORT in Python
# Works efficiently for small integer ranges

def counting_sort(arr):
    # Find the range of input
    max_val = max(arr)
    min_val = min(arr)
    range_val = max_val - min_val + 1

    # Create count array
    count = [0] * range_val

    # Store the count of each element
    for num in arr:
        count[num - min_val] += 1

    # Build the sorted array
    sorted_arr = []
    for i in range(range_val):
        sorted_arr.extend([i + min_val] * count[i])

    return sorted_arr


# MAIN FUNCTION
if __name__ == "__main__":
    arr1 = [4, 2, 2, 8, 3, 3, 1]
    arr2 = [9, 6, 4, 9, 2, 1, 8]
    print("Original:", arr1)
    print("Sorted:", counting_sort(arr1))
    print("Original:", arr2)
    print("Sorted:", counting_sort(arr2))
```

### **Java Code**

```java
// COUNTING SORT in Java
// Best for small integer ranges
public class CountingSort {
    public static void countingSort(int[] arr) {
        int min = arr[0], max = arr[0];
        for (int num : arr) {
            if (num < min) min = num;
            if (num > max) max = num;
        }
        int range = max - min + 1;
        int[] count = new int[range];

        // Count frequency
        for (int num : arr)
            count[num - min]++;

        // Write back sorted values
        int index = 0;
        for (int i = 0; i < range; i++) {
            while (count[i]-- > 0)
                arr[index++] = i + min;
        }
    }

    public static void main(String[] args) {
        int[] arr1 = {4, 2, 2, 8, 3, 3, 1};
        int[] arr2 = {9, 6, 4, 9, 2, 1, 8};
        countingSort(arr1);
        countingSort(arr2);
        System.out.println(java.util.Arrays.toString(arr1));
        System.out.println(java.util.Arrays.toString(arr2));
    }
}
```

**Time Complexity:** O(n + k)  
**Space Complexity:** O(k)  
*(k = range of input values)*

---

## 🧠 Bucket Sort

### **Core Idea**

Bucket Sort divides the input into **buckets (intervals)**, sorts each bucket individually (often with insertion sort), and concatenates results.  
It’s effective for **uniformly distributed floating-point numbers** between 0 and 1.

---

### **Python Code**

```python
# BUCKET SORT in Python
def bucket_sort(arr):
    n = len(arr)
    buckets = [[] for _ in range(n)]

    # Distribute elements into buckets
    for num in arr:
        index = int(n * num)
        buckets[index].append(num)

    # Sort each bucket
    for bucket in buckets:
        bucket.sort()

    # Merge all buckets
    sorted_arr = [num for bucket in buckets for num in bucket]
    return sorted_arr


if __name__ == "__main__":
    arr1 = [0.42, 0.32, 0.23, 0.52, 0.25, 0.47, 0.51]
    arr2 = [0.9, 0.3, 0.6, 0.1, 0.8, 0.5]
    print("Original:", arr1)
    print("Sorted:", bucket_sort(arr1))
    print("Original:", arr2)
    print("Sorted:", bucket_sort(arr2))
```

### **Java Code**

```java
import java.util.*;

public class BucketSort {
    public static void bucketSort(float[] arr) {
        int n = arr.length;
        ArrayList<Float>[] buckets = new ArrayList[n];
        for (int i = 0; i < n; i++)
            buckets[i] = new ArrayList<>();

        // Distribute elements
        for (float num : arr) {
            int index = (int)(n * num);
            buckets[index].add(num);
        }

        // Sort each bucket
        for (ArrayList<Float> bucket : buckets)
            Collections.sort(bucket);

        // Concatenate results
        int idx = 0;
        for (ArrayList<Float> bucket : buckets)
            for (float num : bucket)
                arr[idx++] = num;
    }

    public static void main(String[] args) {
        float[] arr1 = {0.42f, 0.32f, 0.23f, 0.52f, 0.25f, 0.47f, 0.51f};
        float[] arr2 = {0.9f, 0.3f, 0.6f, 0.1f, 0.8f, 0.5f};
        bucketSort(arr1);
        bucketSort(arr2);
        System.out.println(Arrays.toString(arr1));
        System.out.println(Arrays.toString(arr2));
    }
}
```

**Time Complexity:** O(n + k) average, O(n²) worst  
**Space Complexity:** O(n + k)

---

## 🧠 Radix Sort

### **Core Idea**

Radix Sort processes digits **from least significant to most significant** using a stable sort (like Counting Sort).  
It works efficiently for **integers with fixed digit lengths**.

---

### **Python Code**

```python
# RADIX SORT in Python using Counting Sort for each digit

def counting_sort_for_radix(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10

    for num in arr:
        index = (num // exp) % 10
        count[index] += 1

    for i in range(1, 10):
        count[i] += count[i - 1]

    for i in range(n - 1, -1, -1):
        index = (arr[i] // exp) % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1

    for i in range(n):
        arr[i] = output[i]


def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_for_radix(arr, exp)
        exp *= 10


if __name__ == "__main__":
    arr1 = [170, 45, 75, 90, 802, 24, 2, 66]
    arr2 = [5, 3, 8, 6, 9, 2, 1, 7]
    radix_sort(arr1)
    radix_sort(arr2)
    print("Sorted:", arr1)
    print("Sorted:", arr2)
```

### **Java Code**

```java
public class RadixSort {
    static void countingSort(int[] arr, int exp) {
        int n = arr.length;
        int[] output = new int[n];
        int[] count = new int[10];

        for (int num : arr)
            count[(num / exp) % 10]++;

        for (int i = 1; i < 10; i++)
            count[i] += count[i - 1];

        for (int i = n - 1; i >= 0; i--) {
            int index = (arr[i] / exp) % 10;
            output[count[index] - 1] = arr[i];
            count[index]--;
        }

        for (int i = 0; i < n; i++)
            arr[i] = output[i];
    }

    static void radixSort(int[] arr) {
        int max = arr[0];
        for (int num : arr)
            if (num > max) max = num;

        for (int exp = 1; max / exp > 0; exp *= 10)
            countingSort(arr, exp);
    }

    public static void main(String[] args) {
        int[] arr1 = {170, 45, 75, 90, 802, 24, 2, 66};
        int[] arr2 = {5, 3, 8, 6, 9, 2, 1, 7};
        radixSort(arr1);
        radixSort(arr2);
        System.out.println(java.util.Arrays.toString(arr1));
        System.out.println(java.util.Arrays.toString(arr2));
    }
}
```

**Time Complexity:** O(d × (n + k))  
**Space Complexity:** O(n + k)  
*(d = number of digits)*

---

## 🧠 Shell Sort

### **Core Idea**

Shell Sort is a **generalization of Insertion Sort** that allows comparing far-apart elements.  
It starts with a large gap and reduces it over time, improving efficiency for nearly sorted data.

---

### **Python Code**

```python
# SHELL SORT in Python
def shell_sort(arr):
    n = len(arr)
    gap = n // 2

    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2


if __name__ == "__main__":
    arr1 = [12, 34, 54, 2, 3]
    arr2 = [23, 12, 1, 8, 34, 54, 2, 3]
    shell_sort(arr1)
    shell_sort(arr2)
    print("Sorted:", arr1)
    print("Sorted:", arr2)
```

### **Java Code**

```java
public class ShellSort {
    public static void shellSort(int[] arr) {
        int n = arr.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = arr[i];
                int j = i;
                while (j >= gap && arr[j - gap] > temp) {
                    arr[j] = arr[j - gap];
                    j -= gap;
                }
                arr[j] = temp;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr1 = {12, 34, 54, 2, 3};
        int[] arr2 = {23, 12, 1, 8, 34, 54, 2, 3};
        shellSort(arr1);
        shellSort(arr2);
        System.out.println(java.util.Arrays.toString(arr1));
        System.out.println(java.util.Arrays.toString(arr2));
    }
}
```

**Time Complexity:** O(n log²n) average, O(n²) worst  
**Space Complexity:** O(1)

---

Understood. Below is a complete **blog-style explanation** for the four algorithms you mentioned — each explained simply, with **Python and Java** implementations that are **standalone executable files**, include **comments**, **main functions**, and **example runs**.

---

## 🧠 Insertion Sort

### **Core Idea**

Insertion Sort works like sorting playing cards in your hand.  
You take one element at a time and insert it into the correct position among the already sorted elements.

### **Time Complexity**

- Best: O(n)

- Average/Worst: O(n²)

- Space: O(1)

### **Use Case**

Efficient for small or nearly sorted datasets.

---

### Python Code

```python
# Insertion Sort Implementation in Python

def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]  # element to be inserted
        j = i - 1
        # move elements greater than key one position ahead
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key

if __name__ == "__main__":
    # Example 1
    data1 = [12, 11, 13, 5, 6]
    insertion_sort(data1)
    print("Sorted array 1:", data1)

    # Example 2
    data2 = [3, 1, 2, 9, 5]
    insertion_sort(data2)
    print("Sorted array 2:", data2)
```

---

### Java Code

```java
public class InsertionSort {

    public static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            // shift elements greater than key to one position ahead
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr1 = {12, 11, 13, 5, 6};
        insertionSort(arr1);
        System.out.print("Sorted array 1: ");
        for (int x : arr1) System.out.print(x + " ");
        System.out.println();

        int[] arr2 = {3, 1, 2, 9, 5};
        insertionSort(arr2);
        System.out.print("Sorted array 2: ");
        for (int x : arr2) System.out.print(x + " ");
    }
}
```

---

## 🧠 Selection Sort

### **Core Idea**

Selection Sort repeatedly selects the smallest (or largest) element from the unsorted part and places it at the beginning.

### **Time Complexity**

- Best/Average/Worst: O(n²)

- Space: O(1)

### **Use Case**

Simple and predictable for small data sets.

---

### Python Code

```python
def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        # find the smallest element in the remaining array
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]

if __name__ == "__main__":
    data1 = [64, 25, 12, 22, 11]
    selection_sort(data1)
    print("Sorted array 1:", data1)

    data2 = [5, 4, 3, 2, 1]
    selection_sort(data2)
    print("Sorted array 2:", data2)
```

---

### Java Code

```java
public class SelectionSort {

    public static void selectionSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIndex])
                    minIndex = j;
            }
            // swap
            int temp = arr[minIndex];
            arr[minIndex] = arr[i];
            arr[i] = temp;
        }
    }

    public static void main(String[] args) {
        int[] arr1 = {64, 25, 12, 22, 11};
        selectionSort(arr1);
        System.out.print("Sorted array 1: ");
        for (int x : arr1) System.out.print(x + " ");
        System.out.println();

        int[] arr2 = {5, 4, 3, 2, 1};
        selectionSort(arr2);
        System.out.print("Sorted array 2: ");
        for (int x : arr2) System.out.print(x + " ");
    }
}
```

---

## 🧠 Tim Sort

### **Core Idea**

Tim Sort is a hybrid sorting algorithm derived from **Merge Sort** and **Insertion Sort**.  
It splits data into small “runs,” sorts them using insertion sort, and merges runs efficiently using merge sort.

It is the **default sorting algorithm** in **Python (`sorted()`, `list.sort()`)** and **Java (since JDK 7)**.

### **Time Complexity**

- Best: O(n)

- Average/Worst: O(n log n)

- Space: O(n)

### **Use Case**

Real-world general-purpose sorting (used in standard libraries).

---

### Python Code

```python
# Simplified version of TimSort

def insertion_sort(arr, left, right):
    for i in range(left + 1, right + 1):
        key = arr[i]
        j = i - 1
        while j >= left and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key

def merge(arr, l, m, r):
    left = arr[l:m + 1]
    right = arr[m + 1:r + 1]
    i = j = 0
    k = l
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            arr[k] = left[i]
            i += 1
        else:
            arr[k] = right[j]
            j += 1
        k += 1
    arr[k:r + 1] = left[i:] + right[j:]

def tim_sort(arr):
    RUN = 32
    for i in range(0, len(arr), RUN):
        insertion_sort(arr, i, min(i + RUN - 1, len(arr) - 1))

    size = RUN
    while size < len(arr):
        for left in range(0, len(arr), 2 * size):
            mid = min(left + size - 1, len(arr) - 1)
            right = min(left + 2 * size - 1, len(arr) - 1)
            merge(arr, left, mid, right)
        size *= 2

if __name__ == "__main__":
    arr1 = [5, 21, 7, 23, 19]
    tim_sort(arr1)
    print("Sorted array 1:", arr1)

    arr2 = [1, 10, 9, 2, 8, 7]
    tim_sort(arr2)
    print("Sorted array 2:", arr2)
```

---

### Java Code

```java
import java.util.Arrays;

public class TimSort {

    static int RUN = 32;

    public static void insertionSort(int[] arr, int left, int right) {
        for (int i = left + 1; i <= right; i++) {
            int temp = arr[i];
            int j = i - 1;
            while (j >= left && arr[j] > temp) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = temp;
        }
    }

    public static void merge(int[] arr, int l, int m, int r) {
        int[] left = Arrays.copyOfRange(arr, l, m + 1);
        int[] right = Arrays.copyOfRange(arr, m + 1, r + 1);
        int i = 0, j = 0, k = l;

        while (i < left.length && j < right.length)
            arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];

        while (i < left.length) arr[k++] = left[i++];
        while (j < right.length) arr[k++] = right[j++];
    }

    public static void timSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i += RUN)
            insertionSort(arr, i, Math.min(i + RUN - 1, n - 1));

        for (int size = RUN; size < n; size = 2 * size) {
            for (int left = 0; left < n; left += 2 * size) {
                int mid = Math.min(left + size - 1, n - 1);
                int right = Math.min(left + 2 * size - 1, n - 1);
                merge(arr, left, mid, right);
            }
        }
    }

    public static void main(String[] args) {
        int[] arr1 = {5, 21, 7, 23, 19};
        timSort(arr1);
        System.out.println("Sorted array 1: " + Arrays.toString(arr1));

        int[] arr2 = {1, 10, 9, 2, 8, 7};
        timSort(arr2);
        System.out.println("Sorted array 2: " + Arrays.toString(arr2));
    }
}
```

---

## 🧠 Dutch National Flag Algorithm

### **Core Idea**

Developed by **Edsger Dijkstra**, it sorts an array of 0s, 1s, and 2s in one traversal.  
The idea is to partition the array into three sections:

- 0s on the left,

- 1s in the middle,

- 2s on the right.

### **Time Complexity**

- O(n)

- Space: O(1)

### **Use Case**

Used in quicksort’s partitioning and color sorting problems.

---

### Python Code

```python
def dutch_national_flag(arr):
    low, mid, high = 0, 0, len(arr) - 1
    while mid <= high:
        if arr[mid] == 0:
            arr[low], arr[mid] = arr[mid], arr[low]
            low += 1
            mid += 1
        elif arr[mid] == 1:
            mid += 1
        else:  # arr[mid] == 2
            arr[mid], arr[high] = arr[high], arr[mid]
            high -= 1

if __name__ == "__main__":
    arr1 = [2, 0, 2, 1, 1, 0]
    dutch_national_flag(arr1)
    print("Sorted array 1:", arr1)

    arr2 = [0, 1, 2, 0, 1, 2, 1]
    dutch_national_flag(arr2)
    print("Sorted array 2:", arr2)
```

---

### Java Code

```java
import java.util.Arrays;

public class DutchNationalFlag {

    public static void sort012(int[] arr) {
        int low = 0, mid = 0, high = arr.length - 1;
        while (mid <= high) {
            switch (arr[mid]) {
                case 0:
                    int temp0 = arr[low];
                    arr[low] = arr[mid];
                    arr[mid] = temp0;
                    low++;
                    mid++;
                    break;
                case 1:
                    mid++;
                    break;
                case 2:
                    int temp2 = arr[mid];
                    arr[mid] = arr[high];
                    arr[high] = temp2;
                    high--;
                    break;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr1 = {2, 0, 2, 1, 1, 0};
        sort012(arr1);
        System.out.println("Sorted array 1: " + Arrays.toString(arr1));

        int[] arr2 = {0, 1, 2, 0, 1, 2, 1};
        sort012(arr2);
        System.out.println("Sorted array 2: " + Arrays.toString(arr2));
    }
}
```

---
