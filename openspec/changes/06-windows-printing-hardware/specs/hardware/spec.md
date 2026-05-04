# Delta for Hardware

## ADDED Requirements

### Requirement: ESC/POS Thermal Receipt Printing
The system MUST support printing receipts on 80mm thermal printers via ESC/POS over USB and TCP/IP. Templates MUST be configurable for hotel header/footer.

### Requirement: Door Lock Abstraction
The system MUST abstract door lock card encoding behind a trait. At least one implementation (Adel) MUST be provided. Encoding card MUST happen on check-in; cancellation on check-out.

### Requirement: Power Controller
The system SHOULD support turning room power on/off via HTTP/MQTT to a central power controller. On check-in, turn on; on check-out, turn off; on housekeeping mode, pulse with configurable timeout.

### Requirement: Public Display (Second Monitor)
The system MUST support a second window on a designated monitor showing only available rooms. Occupied rooms MUST NOT show guest names (privacy mode).
