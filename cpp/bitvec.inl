#ifndef INCLUDE__BITVEC
#define INCLUDE__BITVEC

#include <iostream>
#include <fstream>
#include <string>
#include <cstdlib>
#include <cstdint>
#include <cstring>

using std::string;
using u8 = std::uint8_t;
using i64 = std::int64_t;
using u64 = std::uint64_t;

const u64 fnv_prime_64 = 1099511628211;
const u64 fnv_offset_basis = 14695981039346656037ULL;

u64 fnv_1a_64(const char *bytes, std::size_t sz) {
	const u8 *data = reinterpret_cast<const u8 *>(bytes);
	u64 hash = fnv_offset_basis;
	for (std::size_t i = 0; i < sz; ++ i) {
		hash ^= data[i];
		hash *= fnv_prime_64;
	}
	return hash;
}

struct bitvec {
	const u64 allOne = 0xFFFFFFFFFFFFFFFFllu;
	const std::size_t size; // bit size
	u64 *vec;
	
	void clear() {
		const std::size_t byteSize = (size / 64) * 8;
		std::memset(vec, 0, byteSize);
	}

	void alloc() {
		assert(vec == nullptr);
		std::size_t vecSize = 1 + (size / 64);
		try {
			vec = new u64[vecSize];
		} catch(std::bad_alloc &badApple) {
			std::cerr << "Aw, snap!\nTerminating ...\n";
			std::abort();
		}
	}

	bitvec(std::size_t bitSize) : size(bitSize), vec(nullptr) {
		assert(sizeof(u64) == 8);
		alloc();
		clear();
	}

	int get_at(std::size_t index) const {
		assert(index < size);
		std::size_t index64 = index / 64;
		u64 item = vec[index64];
		int inner = index % 64;
		return (item >> inner) & 1;
	}

	int set_at(std::size_t index, int bit) {
		assert(index < size);
		std::size_t index64 = index / 64;
		u64 &item = vec[index64];
		int inner = index % 64;

		if (bit == 0) item &= (allOne ^ (1LLU << inner));
		else if (bit == 1) item |= (1LLU << inner);
		return bit;
	}

	void debug() const {
		std::cout << "[bitvec]";
		for (std::size_t i = 0; i < 1 + size / 64; ++ i) {
			std::cout << " ";
			u64 val = vec[i];
			for (int j = 0; j < 64; ++ j) {
				std::cout << int(val & 1);
				val >>= 1;
			}
		}
		std::cout << ";\n";
	}

	~ bitvec() {
		delete[] vec;
		vec = nullptr;
	}

	int operator[](std::size_t index) const {
		return get_at(index);
	}

	bitvec(std::ifstream &stream) : size(0) {
		if (stream.is_open()) {
			stream.read((char *)&size, sizeof(std::size_t));
			std::cout << "recovered size: " << size << "\n";
			alloc();
			stream.read((char *)vec, (1 + size/64) * 8);
			stream.close();
		} else {
			std::cerr << "Stream is not ready;\nTerminating...\n";
			std::abort();
		}
	}

	void dump_to_file(std::string filename) const {
		std::ofstream stream { filename };
		if (stream.is_open()) {
			stream.write((char *)&size, sizeof(std::size_t));
			std::size_t vecSize = 1 + (size / 64);
			std::size_t saveByteSize = vecSize * 8;
			stream.write((char *)vec, saveByteSize);
			stream.close();
		} else {
			std::cerr << "Cannot dump to file: " << filename << " ; \nTerminating...\n";
			std::abort();
		}
	}
};

#endif
