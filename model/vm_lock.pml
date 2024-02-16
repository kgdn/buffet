// Buffet - Virtual machine locking system formal verification model

#define MAX_VM 5
#define MAX_USERS 5
#define FIRST_PORT 5700
#define NUM_ISOS 17

typedef VirtualMachine {
    byte iso;
    byte port;
    byte process_id;
    byte user_id;
};

VirtualMachine vm[MAX_USERS];
byte next_port = FIRST_PORT; 
byte isos[NUM_ISOS] = {
    1,  // almalinux.iso
    2,  // alpine.iso
    3,  // amogos.iso
    4,  // archlinux.iso
    5,  // artix.iso
    6,  // debian.iso
    7,  // devuan.iso
    8,  // fedora.iso
    9,  // fedora_test.iso
    10, // gentoo.iso
    11, // linuxmint.iso
    12, // manjaro.iso
    13, // nixos.iso
    14, // opensuse-tumbleweed.iso
    15, // rocky-linux.iso
    16, // ubuntu.iso
    17  // void-linux.iso
};

// LTL - The user can only have one virtual machine at a time
ltl no_multiple_vms {
    [] ((vm[0].user_id != 0 -> X(vm[0].user_id == 0)) &&
        (vm[1].user_id != 0 -> X(vm[1].user_id == 0)) &&
        (vm[2].user_id != 0 -> X(vm[2].user_id == 0)) &&
        (vm[3].user_id != 0 -> X(vm[3].user_id == 0)) &&
        (vm[4].user_id != 0 -> X(vm[4].user_id == 0)))
}

// User process - binds a virtual machine to a user
proctype User(byte id; byte iso_index; byte process_id) {
    do
    :: (vm[id].user_id == 0) -> 
        vm[id].iso = isos[iso_index];
        vm[id].port = next_port;
        vm[id].process_id = process_id;
        vm[id].user_id = id+1;
        next_port = next_port + 1;
    od
}

init { atomic {
    byte i;
    for (i : 0 .. MAX_USERS-1) {
        run User(i, i%NUM_ISOS, i);
    }
}}
