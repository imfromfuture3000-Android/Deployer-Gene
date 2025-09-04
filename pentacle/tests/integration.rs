use pentacle::emit_pentacle_pulse;

#[test]
fn test_emit_pulse() {
    // Just ensure the function can be called without panic
    emit_pentacle_pulse(3);
    assert_eq!(2 + 2, 4);
}
